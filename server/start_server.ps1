$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start listener on port $port. Make sure the port is not in use and you have appropriate permissions."
    exit
}

Write-Host "=================================================="
Write-Host "SurfaceQ Native Server running at http://localhost:$port"
Write-Host "Dashboard: http://localhost:$port/dashboard.html"
Write-Host "Press Ctrl+C in terminal to stop the server."
Write-Host "=================================================="

$rootPath = "C:\Users\mrina\Downloads\Surface-Q"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $url = $request.Url.LocalPath
        
        # Add CORS Headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # Route matching
        if ($url -eq "/" -or $url -eq "/index.html") {
            $filePath = Join-Path $rootPath "index.html"
            $bytes = [IO.File]::ReadAllBytes($filePath)
            $response.ContentType = "text/html"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        elseif ($url -eq "/dashboard.html") {
            $filePath = Join-Path $rootPath "dashboard.html"
            $bytes = [IO.File]::ReadAllBytes($filePath)
            $response.ContentType = "text/html"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        elseif ($url.StartsWith("/components/") -or $url.StartsWith("/modules/") -or $url.StartsWith("/assets/")) {
            $cleanUrl = $url.Replace('/', '\')
            if ($cleanUrl.StartsWith('\')) { $cleanUrl = $cleanUrl.Substring(1) }
            $filePath = Join-Path $rootPath $cleanUrl
            
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [IO.File]::ReadAllBytes($filePath)
                if ($url.EndsWith(".js")) { $response.ContentType = "application/javascript" }
                elseif ($url.EndsWith(".css")) { $response.ContentType = "text/css" }
                elseif ($url.EndsWith(".png")) { $response.ContentType = "image/png" }
                else { $response.ContentType = "application/octet-stream" }
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
            }
        }
        elseif ($request.HttpMethod -eq "POST" -and $url -eq "/api/scans") {
            $reader = New-Object IO.StreamReader($request.InputStream, [Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $global:LatestScan = $body
            $json = '{"status":"success","message":"Scan data cached"}'
            $bytes = [Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/api/scans/latest") {
            $json = $global:LatestScan
            if (-not $json) {
                $json = '{"error":"No scan data available"}'
                $response.StatusCode = 404
            }
            $bytes = [Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        elseif ($url -eq "/api/health") {
            $json = '{"status":"ok","message":"SurfaceQ Native PowerShell Server is running"}'
            $bytes = [Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # Handle exceptions gracefully to keep server loop running
        Write-Host 'Request handling error: ' $_
    }
}
