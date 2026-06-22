$port = 8765
$url = "http://127.0.0.1:$port/index.html"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$server = Join-Path $root "server.js"

function Test-LocalPort {
  param([int]$Port)
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $async = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(180)) { return $false }
    $client.EndConnect($async)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

if (-not (Test-LocalPort -Port $port)) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    Start-Process -FilePath $node.Source -ArgumentList "`"$server`"" -WorkingDirectory $root -WindowStyle Hidden
    Start-Sleep -Milliseconds 700
  } else {
    Start-Process (Join-Path $root "index.html")
    exit
  }
}

Start-Process $url
