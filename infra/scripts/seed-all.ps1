param(
    [string]$MySqlContainer = "roomie-mysql",
    [string]$MongoContainer = "roomie-mongodb",
    [string]$Neo4jContainer = "roomie-neo4j",
    [string]$MySqlInitFile = "",
    [string]$MongoInitFile = "",
    [string]$Neo4jInitFile = "",
    [string]$Neo4jAuth = ""
)

$ErrorActionPreference = "Stop"

$infraDir = Split-Path $PSScriptRoot -Parent
$repoRoot = Split-Path $infraDir -Parent

if ([string]::IsNullOrWhiteSpace($MySqlInitFile)) {
    $MySqlInitFile = Join-Path $infraDir "init.sql"
}
if ([string]::IsNullOrWhiteSpace($MongoInitFile)) {
    $MongoInitFile = Join-Path $infraDir "init-mongo.js"
}
if ([string]::IsNullOrWhiteSpace($Neo4jInitFile)) {
    $Neo4jInitFile = Join-Path $infraDir "init-neo4j.cypher"
}

function Assert-FileExists {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }
}

function Assert-ContainerRunning {
    param([string]$ContainerName)
    $running = docker inspect -f "{{.State.Running}}" $ContainerName 2>$null
    if ($LASTEXITCODE -ne 0 -or $running -ne "true") {
        throw "Container '$ContainerName' is not running."
    }
}

function Run-OrFail {
    param(
        [string]$Step,
        [scriptblock]$Action
    )
    Write-Host "\n==> $Step"
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "Step failed: $Step"
    }
}

Assert-FileExists -Path $MySqlInitFile
Assert-FileExists -Path $MongoInitFile
Assert-FileExists -Path $Neo4jInitFile

Assert-ContainerRunning -ContainerName $MySqlContainer
Assert-ContainerRunning -ContainerName $MongoContainer
Assert-ContainerRunning -ContainerName $Neo4jContainer

Run-OrFail -Step "Seed MySQL" -Action {
    $tmpSql = "/tmp/init.sql"
    docker cp $MySqlInitFile "$MySqlContainer`:$tmpSql"
    if ($LASTEXITCODE -ne 0) { exit 1 }

    docker exec $MySqlContainer sh -lc 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot "${MYSQL_DATABASE:-roomie}" < /tmp/init.sql'
    if ($LASTEXITCODE -ne 0) { exit 1 }

    docker exec $MySqlContainer rm -f $tmpSql | Out-Null
}

Run-OrFail -Step "Seed MongoDB" -Action {
    $tmpMongo = "/tmp/init-mongo.js"
    docker cp $MongoInitFile "$MongoContainer`:$tmpMongo"
    if ($LASTEXITCODE -ne 0) { exit 1 }

    docker exec $MongoContainer sh -lc 'DB_NAME="${MONGO_INITDB_DATABASE:-roomie}"; USER_NAME="${MONGO_INITDB_ROOT_USERNAME:-admin}"; mongosh --quiet --username "$USER_NAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "$DB_NAME" /tmp/init-mongo.js'
    if ($LASTEXITCODE -ne 0) { exit 1 }

    docker exec $MongoContainer rm -f $tmpMongo | Out-Null
}

Run-OrFail -Step "Seed Neo4j" -Action {
    $authValue = $Neo4jAuth
    if ([string]::IsNullOrWhiteSpace($authValue)) {
        $authValue = (docker exec $Neo4jContainer printenv NEO4J_AUTH).Trim()
    }

    if ([string]::IsNullOrWhiteSpace($authValue)) {
        throw "Cannot resolve Neo4j auth. Provide -Neo4jAuth 'neo4j/password'."
    }

    $parts = $authValue.Split("/", 2)
    if ($parts.Length -ne 2 -or [string]::IsNullOrWhiteSpace($parts[0]) -or [string]::IsNullOrWhiteSpace($parts[1])) {
        throw "Invalid Neo4j auth format. Expected 'username/password'."
    }

    $seedNeo4jScript = Join-Path $PSScriptRoot "seed-neo4j.ps1"
    if (-not (Test-Path $seedNeo4jScript)) {
        throw "Required script not found: $seedNeo4jScript"
    }

    & $seedNeo4jScript -ContainerName $Neo4jContainer -Username $parts[0] -Password $parts[1] -CypherFile $Neo4jInitFile
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "\nAll sample data seeded successfully (MySQL + MongoDB + Neo4j)."
