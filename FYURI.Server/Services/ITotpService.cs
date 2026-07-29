namespace FYURI.Server.Services;

public interface ITotpService
{
    string GenerateSecret();
    string GenerateQrCodeDataUri(string email, string secret, string issuer = "FYURI Admin");
    bool ValidateCode(string secret, string code);
}
