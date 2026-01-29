# Simple Migration Script - Create Product Options
# Run each command individually

Write-Host "🔄 Creando opciones de producto...`n" -ForegroundColor Cyan

# Categories
Write-Host "📦 Categorías:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"category","value":"split","label":"Split / Minisplit"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"category","value":"cassette","label":"Cassette 4 Vías"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"category","value":"piso-cielo","label":"Piso-Cielo"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"category","value":"industrial","label":"Industrial"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"category","value":"accesorio","label":"Accesorio"}' -ContentType "application/json"

Write-Host "`n🔥 BTU:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"9000","label":"9.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"12000","label":"12.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"18000","label":"18.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"24000","label":"24.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"30000","label":"30.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"36000","label":"36.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"48000","label":"48.000 BTU"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"btu","value":"60000","label":"60.000 BTU"}' -ContentType "application/json"

Write-Host "`n📋 Condiciones:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"condition","value":"nuevo","label":"Nuevo"}' -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/product-options" -Method Post -Body '{"type":"condition","value":"usado","label":"Usado"}' -ContentType "application/json"

Write-Host "`n✅ Migración completada!" -ForegroundColor Green
