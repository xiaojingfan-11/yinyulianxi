$files = @(
  "index.html",
  "app-config.js",
  "manifest.webmanifest",
  "sw.js",
  "icon.svg"
)

New-Item -ItemType Directory -Force public | Out-Null
foreach ($file in $files) {
  Copy-Item $file -Destination public -Force
}

Write-Output "Synced static files to public/"
