using System.Collections.Concurrent;
using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Codlek.Api.Tests;

/// <summary>
/// Codlek:SiteProxy: the API's host also serves the public site. A small stand-in for the site
/// runs on a local port; the API passes it every path the API doesn't own.
/// </summary>
[Collection("api")]
public sealed class SiteProxyTests(ApiFactory factory) : IAsyncLifetime
{
    private readonly ConcurrentQueue<string> siteSaw = new();
    private WebApplication site = null!;
    private WebApplicationFactory<Program> api = null!;
    private HttpClient client = null!;

    public async Task InitializeAsync()
    {
        var builder = WebApplication.CreateSlimBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        site = builder.Build();
        site.Use((context, next) =>
        {
            siteSaw.Enqueue(context.Request.Path + context.Request.QueryString);
            return next(context);
        });
        // Next.js builds its redirects from the host it was asked for: here, its own.
        site.MapGet("/old", (HttpRequest request) => Results.Redirect($"{request.Scheme}://{request.Host}/en/about?from=old"));
        site.MapGet("/elsewhere", () => Results.Redirect("https://example.com/page"));
        site.MapFallback("{**path}", (HttpRequest request) => Results.Text($"site page {request.Path}{request.QueryString}"));
        await site.StartAsync();

        api = factory.WithWebHostBuilder(builder => builder.UseSetting("Codlek:SiteProxy", site.Urls.First()));
        client = api.CreateClient(new() { AllowAutoRedirect = false });
    }

    public async Task DisposeAsync()
    {
        client.Dispose();
        await api.DisposeAsync();
        await site.DisposeAsync();
    }

    [Theory]
    [InlineData("/")]
    [InlineData("/about")]
    [InlineData("/en/blog?page=2")]
    [InlineData("/_next/static/chunks/main.js")]
    public async Task Paths_the_api_does_not_own_are_the_site(string path)
    {
        var response = await client.GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal($"site page {path}", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task The_api_keeps_its_own_paths()
    {
        var health = await client.GetAsync("/api/health");
        var unknown = await client.GetAsync("/api/nothing-here");
        var dashboard = await client.GetAsync("/admin/login");

        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
        Assert.DoesNotContain("site page", await dashboard.Content.ReadAsStringAsync());
        Assert.DoesNotContain(siteSaw, path => path.StartsWith("/api") || path.StartsWith("/admin"));
    }

    [Fact]
    public async Task A_redirect_of_the_site_stays_on_this_host()
    {
        var own = await client.GetAsync("/old");
        var other = await client.GetAsync("/elsewhere");

        Assert.Equal("/en/about?from=old", own.Headers.Location?.OriginalString);
        Assert.Equal("https://example.com/page", other.Headers.Location?.OriginalString);
    }
}
