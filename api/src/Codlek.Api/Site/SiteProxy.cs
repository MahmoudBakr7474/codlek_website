using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

namespace Codlek.Api.Site;

/// <summary>
/// The public site (Next.js on Vercel) under this host's own address. With Codlek:SiteProxy
/// set to the site's Vercel address, every path the API doesn't own (/api, /admin and the
/// files in wwwroot and /uploads) is fetched from the site and passed through, so
/// codlek.tryasp.net is the site and codlek.tryasp.net/admin the dashboard. Without it (local
/// runs, tests) nothing changes. The site sees its own host, so a redirect it sends to that host
/// loses the host (a relative Location), which keeps the visitor on this one.
/// </summary>
public static class SiteProxy
{
    /// <summary>The site's origin (scheme and host), or null when the proxy is off or misconfigured.</summary>
    public static string? Origin(IConfiguration config) =>
        config["Codlek:SiteProxy"] is { Length: > 0 } url && Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme is "https" or "http"
            ? uri.GetLeftPart(UriPartial.Authority)
            : null;

    public static void AddSiteProxy(this IServiceCollection services, string origin)
    {
        var siteHost = new Uri(origin).Host;

        services.AddReverseProxy()
            .LoadFromMemory(
                // Order int.MaxValue and a bare catch-all: every route of the API, and the dashboard's
                // fallback (/admin/...), is more specific and wins.
                [new RouteConfig { RouteId = "site", ClusterId = "site", Order = int.MaxValue, Match = new RouteMatch { Path = "{**path}" } }],
                [new ClusterConfig { ClusterId = "site", Destinations = new Dictionary<string, DestinationConfig> { ["vercel"] = new() { Address = origin } } }])
            .AddTransforms(context => context.AddResponseTransform(transform =>
            {
                if (transform.ProxyResponse?.Headers.Location is { IsAbsoluteUri: true } location && location.Host.Equals(siteHost, StringComparison.OrdinalIgnoreCase))
                {
                    transform.HttpContext.Response.Headers.Location = location.PathAndQuery + location.Fragment;
                }

                return ValueTask.CompletedTask;
            }));
    }
}
