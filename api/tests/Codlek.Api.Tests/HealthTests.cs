using System.Net;

namespace Codlek.Api.Tests;

[Collection("api")]
public class HealthTests(ApiFactory factory)
{
    [Fact]
    public async Task Health_endpoint_answers()
    {
        var response = await factory.CreateClient().GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task The_bare_address_opens_the_dashboard()
    {
        var client = factory.CreateClient(new() { AllowAutoRedirect = false });

        var response = await client.GetAsync("/");

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Assert.Equal("/admin/", response.Headers.Location?.OriginalString);
    }
}
