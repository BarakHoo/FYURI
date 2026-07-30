namespace FYURI.Server.Data;

internal static class AdminAccountCommand
{
    private const string ResetCommand = "reset-admin";

    internal static bool IsReset(string[] arguments)
    {
        ArgumentNullException.ThrowIfNull(arguments);

        if (arguments.Length == 1
            && string.Equals(arguments[0], ResetCommand, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (arguments.Any(argument =>
                string.Equals(argument, ResetCommand, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException(
                "reset-admin must be the only command-line argument. Supply configuration through protected environment variables.");
        }

        return false;
    }
}
