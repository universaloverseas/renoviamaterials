$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:5599/')
$listener.Start()
Write-Host "serving $root on http://localhost:5599/"
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css'; '.js'='application/javascript'; '.svg'='image/svg+xml'; '.xml'='application/xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.ico'='image/x-icon'; '.json'='application/json' }
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
    $full = Join-Path $root $rel
    if (Test-Path $full -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $nf = [System.Text.Encoding]::UTF8.GetBytes('404')
      $ctx.Response.OutputStream.Write($nf, 0, $nf.Length)
    }
    $ctx.Response.Close()
  } catch { }
}
