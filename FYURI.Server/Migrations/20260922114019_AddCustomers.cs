using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace FYURI.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerCompany",
                table: "OrderRequests",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "OrderRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    Company = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true),
                    Email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true),
                    Phone = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true),
                    NormalizedPhone = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true),
                    NormalizedName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    NormalizedCompany = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "varchar(8000)", maxLength: 8000, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    LastOrderDate = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CustomerOwnedItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false),
                    SerialNumber = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true),
                    AddedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerOwnedItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerOwnedItems_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CustomerOwnedItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequests_CustomerId",
                table: "OrderRequests",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOwnedItems_CustomerId",
                table: "CustomerOwnedItems",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerOwnedItems_ProductId",
                table: "CustomerOwnedItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_NormalizedCompany",
                table: "Customers",
                column: "NormalizedCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_NormalizedEmail",
                table: "Customers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_NormalizedName",
                table: "Customers",
                column: "NormalizedName");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_NormalizedPhone",
                table: "Customers",
                column: "NormalizedPhone");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_Customers_CustomerId",
                table: "OrderRequests",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_Customers_CustomerId",
                table: "OrderRequests");

            migrationBuilder.DropTable(
                name: "CustomerOwnedItems");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_CustomerId",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "CustomerCompany",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "OrderRequests");
        }
    }
}
