using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Codlek.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProjectGallery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "gallery",
                table: "projects",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "gallery",
                table: "projects");
        }
    }
}
