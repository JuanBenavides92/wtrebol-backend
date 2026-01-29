# Script para reemplazar las rutas stub por las del controlador en server.ts

$serverPath = "C:\Users\Juan Usuga\Desktop\Martben\wtrebol-backend\src\server.ts"

Write-Host "`n🔧 Actualizando server.ts para usar controlador real..." -ForegroundColor Cyan

# Leer el archivo
$content = Get-Content $serverPath -Raw

# Reemplazo 1: La función GET inline stub
$oldGetHandler = @'
// GET /:type - Obtener opciones por tipo
app.get('/api/product-options/:type', (req, res) => {
    const { type } = req.params;
    const { active } = req.query;
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 [GET /api/product-options/:type] INLINE');
    console.log('  ├─ Type:', type);
    console.log('  └─ Query active:', active);
    console.log('═══════════════════════════════════════════════════════');
    
    res.json({ 
        success: true, 
        count: 0, 
        data: [],
        message: `Inline stub working for type: ${type}`
    });
});

// POST / - Crear nueva opción
app.post('/api/product-options', (req, res) => {
    console.log('📋 [POST /api/product-options] INLINE');
    res.json({ success: true, message: 'Inline POST works' });
});
'@

$newHandler = @'
// GET /:type - Obtener opciones por tipo (USANDO CONTROLADOR)
app.get('/api/product-options/:type', productOptionsController.getOptionsByType);

// POST / - Crear nueva opción (USANDO CONTROLADOR)
app.post('/api/product-options', productOptionsController.createOption);

// PUT /:id - Actualizar opción (USANDO CONTROLADOR)
app.put('/api/product-options/:id', productOptionsController.updateOption);

// DELETE /:id - Eliminar opción (USANDO CONTROLADOR)
app.delete('/api/product-options/:id', productOptionsController.deleteOption);
'@

if ($content -match [regex]::Escape($oldGetHandler)) {
    $content = $content -replace [regex]::Escape($oldGetHandler), $newHandler
    Write-Host "✅ Reemplazadas funciones stub por controlador" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se encontró el patrón exacto stub" -ForegroundColor Yellow
}

# Reemplazo 2: Mensaje de log inicial
$content = $content -replace "// Rutas de opciones de producto - INLINE \(bypass import issue\)", "// Rutas de opciones de producto - INLINE (CON CONTROLADOR REAL)"
$content = $content -replace "console\.log\('\📋 \[INLINE\] Registrando rutas de product-options INLINE\.\.\.'\);", "console.log('📋 [INLINE-CONTROLLER] Registrando rutas con CONTROLADOR...');"

# Reemplazo 3: Mensaje de éxito
$content = $content -replace "console\.log\('\✅ \[INLINE\] Rutas de product-options INLINE registradas'\);", "console.log('✅ [INLINE-CONTROLLER] Rutas con CONTROLADOR registradas');"

# Guardar el archivo
$content | Set-Content $serverPath -Encoding UTF8
Write-Host "✅ Archivo server.ts actualizado" -ForegroundColor Green

Write-Host "`n🔄 Esperando que nodemon reinicie el backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "`n🧪 Probando endpoint CON datos reales de MongoDB...`n" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/product-options/category?active=true" -TimeoutSec 5
    Write-Host "📊 Resultado:" -ForegroundColor Green
    Write-Host "   Count: $($response.count)" -ForegroundColor White
    Write-Host "   Success: $($response.success)" -ForegroundColor White
    
    if ($response.count -gt 0) {
        Write-Host "`n🎉 ¡ÉXITO! El controlador está devolviendo datos reales:" -ForegroundColor Green
        $response.data[0..2] | ForEach-Object {
            Write-Host "   - $($_.label)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`n⚠️  Count is 0 - el controlador aún no está conectado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
