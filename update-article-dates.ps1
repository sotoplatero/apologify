# Script para actualizar fechas de artículos semanalmente
# Los artículos se publican semanalmente, empezando desde hoy hacia atrás

# Obtener la fecha de hoy
$today = Get-Date

# Obtener todos los directorios de artículos que empiecen con "write-apology-letter"
$articleDirs = Get-ChildItem -Path "src\content\articles" -Directory | Where-Object { $_.Name -like "write-apology-letter-*" } | Sort-Object Name

Write-Host "Encontrados $($articleDirs.Count) artículos para actualizar"

# Contador para las semanas
$weekCounter = 0

foreach ($articleDir in $articleDirs) {
    $indexPath = Join-Path $articleDir.FullName "index.md"
    
    if (Test-Path $indexPath) {
        # Calcular la fecha (hoy menos las semanas correspondientes)
        $articleDate = $today.AddDays(-7 * $weekCounter)
        
        # Formatear la fecha en el formato ISO 8601 como en los archivos originales
        $formattedDate = $articleDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        
        Write-Host "Procesando: $($articleDir.Name) - Fecha: $formattedDate"
        
        # Leer el contenido del archivo
        $content = Get-Content $indexPath -Raw
        
        # Buscar y reemplazar la línea de fecha usando regex
        $pattern = 'date:\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z'
        $replacement = "date: $formattedDate"
        
        if ($content -match $pattern) {
            $newContent = $content -replace $pattern, $replacement
            
            # Escribir el contenido actualizado
            Set-Content -Path $indexPath -Value $newContent -NoNewline
            Write-Host "  ✓ Fecha actualizada"
        } else {
            Write-Host "  ⚠ No se encontró el patrón de fecha en $($articleDir.Name)"
        }
        
        $weekCounter++
    } else {
        Write-Host "  ⚠ No se encontró index.md en $($articleDir.Name)"
    }
}

Write-Host ""
Write-Host "Proceso completado. Se procesaron $weekCounter artículos."
$oldestDate = $today.AddDays(-7 * ($weekCounter - 1)).ToString('yyyy-MM-dd')
Write-Host "Fecha más antigua asignada: $oldestDate" 