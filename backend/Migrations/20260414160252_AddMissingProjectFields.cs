using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingProjectFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ShortDescription",
                table: "Projects",
                newName: "Status");

            migrationBuilder.AddColumn<string>(
                name: "AuthorEmail",
                table: "Projects",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AuthorId",
                table: "Projects",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "AuthorUsername",
                table: "Projects",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Projects",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorEmail",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "AuthorId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "AuthorUsername",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Projects");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Projects",
                newName: "ShortDescription");
        }
    }
}
