# Migration Script: Create Product Options via API
# Execute with: pwsh migrate-options.ps1

$API_BASE = "http://localhost:5000/api/product-options"

Write-Host "🔄 Iniciando migración de opciones de producto...`n" -ForegroundColor Cyan

$totalCreated = 0
$totalSkipped = 0

# Categories
Write-Host "📦 Migrando categorías..." -ForegroundColor Yellow
$categories = @(
    @{value="split"; label="Split / Minisplit"},
    @{value="cassette"; label="Cassette 4 Vías"},
    @{value="piso-cielo"; label="Piso-Cielo"},
    @{value="industrial"; label="Industrial"},
    @{value="accesorio"; label="Accesorio"}
)

foreach ($cat in $categories) {
    $body = @{
        type = "category"
        value = $cat.value
        label = $cat.label
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $API_BASE -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Categoría '$($cat.label)' creada" -ForegroundColor Green
        $totalCreated++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "   ⏭️  Categoría '$($cat.label)' ya existe" -ForegroundColor Gray
            $totalSkipped++
        } else {
            Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# BTU Options
Write-Host "`n🔥 Migrando capacidades BTU..." -ForegroundColor Yellow
$btuOptions = @(
    @{value="9000"; label="9.000 BTU"},
    @{value="12000"; label="12.000 BTU"},
    @{value="18000"; label="18.000 BTU"},
    @{value="24000"; label="24.000 BTU"},
    @{value="30000"; label="30.000 BTU"},
    @{value="36000"; label="36.000 BTU"},
    @{value="48000"; label="48.000 BTU"},
    @{value="60000"; label="60.000 BTU"}
)

foreach ($btu in $btuOptions) {
    $body = @{
        type = "btu"
        value = $btu.value
        label = $btu.label
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $API_BASE -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ BTU '$($btu.label)' creado" -ForegroundColor Green
        $totalCreated++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "   ⏭️  BTU '$($btu.label)' ya existe" -ForegroundColor Gray
            $totalSkipped++
        } else {
            Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Conditions
Write-Host "`n📋 Migrando condiciones..." -ForegroundColor Yellow
$conditions = @(
    @{value="nuevo"; label="Nuevo"},
    @{value="usado"; label="Usado"}
)

foreach ($cond in $conditions) {
    $body = @{
        type = "condition"
        value = $cond.value
        label = $cond.label
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $API_BASE -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Condición '$($cond.label)' creada" -ForegroundColor Green
        $totalCreated++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "   ⏭️  Condición '$($cond.label)' ya existe" -ForegroundColor Gray
            $totalSkipped++
        } else {
            Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n$('=' * 50)" -ForegroundColor Cyan
Write-Host "✅ Migración completada!" -ForegroundColor Green
Write-Host "   📊 Total creadas: $totalCreated" -ForegroundColor White
Write-Host "   ⏭️  Total omitidas: $totalSkipped" -ForegroundColor White
Write-Host "$('=' * 50)`n" -ForegroundColor Cyan
