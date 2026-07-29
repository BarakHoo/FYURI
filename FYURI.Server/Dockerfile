# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY FYURI.Server/FYURI.Server.csproj FYURI.Server/
RUN dotnet restore "FYURI.Server/FYURI.Server.csproj"

# Copy everything else and build
COPY FYURI.Server/ FYURI.Server/
WORKDIR "/src/FYURI.Server"
RUN dotnet build "FYURI.Server.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "FYURI.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Create directories for images
RUN mkdir -p /app/wwwroot/images/products /app/wwwroot/images/banners

EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FYURI.Server.dll"]
