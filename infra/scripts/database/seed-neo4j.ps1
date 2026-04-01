param(
    [string]$ContainerName = "roomie-neo4j",
    [string]$Username = "neo4j",
    [string]$Password = "",
    [string]$CypherFile = "infra/init-neo4j.cypher"
)

if ([string]::IsNullOrWhiteSpace($Password)) {
    Write-Error "Please provide -Password for Neo4j."
    exit 1
}

if (-not (Test-Path $CypherFile)) {
    Write-Error "Cypher file not found: $CypherFile"
    exit 1
}

$containerState = docker inspect -f "{{.State.Running}}" $ContainerName 2>$null
if ($LASTEXITCODE -ne 0 -or $containerState -ne "true") {
    Write-Error "Neo4j container '$ContainerName' is not running."
    exit 1
}

$tempFile = "/tmp/init-neo4j.cypher"
docker cp $CypherFile "$ContainerName`:$tempFile"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to copy Cypher file into container."
    exit 1
}

docker exec $ContainerName cypher-shell -u $Username -p $Password -f $tempFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to seed Neo4j data."
    exit 1
}

docker exec $ContainerName rm -f $tempFile | Out-Null

Write-Host "Neo4j sample data seeded successfully."
