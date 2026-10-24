using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Codlek.Api.Data.Migrations
{
    /// <summary>
    /// Data only. The import stored copies of six home blocks that equal the old shipped content, so they
    /// hid the rewritten copy and the wider technologies list in site-defaults.json. Each row is dropped
    /// (the site then uses the defaults) only while it is still exactly the imported text: SHA-256 of the
    /// stored value. A block the owner has edited in the dashboard stays as it is.
    /// </summary>
    public partial class DropStaleHomeCopies : Migration
    {
        private static readonly (string Key, string Sha256)[] ImportedCopies =
        [
            ("home.why", "0xE684FCB22F60232F699C38B63AA415E2606D28E8075AD4E58690883CB1DCEFA4"),
            ("home.hero_stats", "0x1C529B0F01B34ECF3A20FE6635BD3AAB48143C6FE4FC536B86F650B35568DBB1"),
            ("home.industries", "0x6291A7A0D9FC221B8504810E6E28E55054B78F207CDB13C11829B275F5EE7109"),
            ("home.journey", "0x59E6B4CBA8F8225ABF292491C2933720AE789B52977C349C6AC7398D732764E0"),
            ("home.team", "0x424E137CD0D5CE1032A406C979D3AAB599EBDF5ECA8BDB249ABB2D955C9D6D5A"),
            ("home.technologies", "0x1B1F445D96993FD7DF22D09CF8603B9E8214E15A31DC10C28A9FF4D84066FD32"),
        ];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var (key, sha256) in ImportedCopies)
            {
                migrationBuilder.Sql($"DELETE FROM settings WHERE [key] = N'{key}' AND HASHBYTES('SHA2_256', value) = {sha256};");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Nothing to restore: a missing row means "use the default".
        }
    }
}
