Add-Type -AssemblyName System.Drawing

$srcPath = "c:\helper\mobile\src\assets\logo.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source logo not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

$mipmapDirs = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$baseResDir = "c:\helper\mobile\android\app\src\main\res"

foreach ($entry in $mipmapDirs.GetEnumerator()) {
    $dirName = $entry.Key
    $size = $entry.Value
    $targetDir = Join-Path $baseResDir $dirName

    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    # Generate standard square/adaptive launcher icon
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($srcImg, 0, 0, $size, $size)
    $g.Dispose()

    $launcherFile = Join-Path $targetDir "ic_launcher.png"
    $bmp.Save($launcherFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    # Generate round launcher icon
    $roundBmp = New-Object System.Drawing.Bitmap($size, $size)
    $rg = [System.Drawing.Graphics]::FromImage($roundBmp)
    $rg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $rg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $rg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $rg.Clear([System.Drawing.Color]::Transparent)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $rg.SetClip($path)
    $rg.DrawImage($srcImg, 0, 0, $size, $size)
    $path.Dispose()
    $rg.Dispose()

    $roundFile = Join-Path $targetDir "ic_launcher_round.png"
    $roundBmp.Save($roundFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $roundBmp.Dispose()

    Write-Output "Generated $dirName (${size}x${size}): ic_launcher.png and ic_launcher_round.png"
}

$srcImg.Dispose()
Write-Output "All Android launcher icons successfully updated with the new brand logo!"
