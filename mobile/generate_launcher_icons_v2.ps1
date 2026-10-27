Add-Type -AssemblyName System.Drawing

$mipmapDirs = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$baseResDir = "c:\helper\mobile\android\app\src\main\res"

function Draw-Brand-Icon {
    param(
        [int]$size,
        [bool]$isRound
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(255, 255, 77, 45) # #FF4D2D
    $color2 = [System.Drawing.Color]::FromArgb(255, 225, 35, 12) # #E1230C
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45.0)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($isRound) {
        $path.AddEllipse(0, 0, $size, $size)
    } else {
        # Squircle / Rounded Rectangle (20% corner radius)
        $r = [int]($size * 0.22)
        $d = $r * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($size - $d, 0, $d, $d, 270, 90)
        $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
        $path.AddArc(0, $size - $d, $d, $d, 90, 90)
        $path.CloseFigure()
    }

    $g.FillPath($gradBrush, $path)
    $gradBrush.Dispose()

    # Subtle inner border for luxury feel
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), [Math]::Max(1.0, [float]($size * 0.015)))
    $g.DrawPath($borderPen, $path)
    $borderPen.Dispose()
    $path.Dispose()

    # Center "H"
    $fontSize = [int]($size * 0.52)
    $fontFamily = New-Object System.Drawing.FontFamily("Arial Black")
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    $strFmt = New-Object System.Drawing.StringFormat
    $strFmt.Alignment = [System.Drawing.StringAlignment]::Center
    $strFmt.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Slight drop shadow for H
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 0, 0, 0))
    $hOffsetY = [float]($size * 0.02)
    $shadowRect = New-Object System.Drawing.RectangleF(0.0, [float]($hOffsetY + 1.0), [float]$size, [float]$size)
    $g.DrawString("H", $font, $shadowBrush, $shadowRect, $strFmt)
    $shadowBrush.Dispose()

    # White H
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $hRect = New-Object System.Drawing.RectangleF(0.0, $hOffsetY, [float]$size, [float]$size)
    $g.DrawString("H", $font, $whiteBrush, $hRect, $strFmt)
    $whiteBrush.Dispose()
    $font.Dispose()
    $fontFamily.Dispose()
    $strFmt.Dispose()

    # Golden Sparkle ✦ on top-right of H
    $sparkSize = [int]($size * 0.22)
    $sparkFont = New-Object System.Drawing.Font("Arial", $sparkSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71)) # #FDE047
    $sparkX = [float]($size * 0.64)
    $sparkY = [float]($size * 0.14)
    $g.DrawString([char]0x2726, $sparkFont, $goldBrush, $sparkX, $sparkY)
    $goldBrush.Dispose()
    $sparkFont.Dispose()

    # "PRO" pill at bottom
    if ($size -ge 72) {
        $pillW = [float]($size * 0.28)
        $pillH = [float]($size * 0.10)
        $pillX = [float](($size - $pillW) / 2.0)
        $pillY = [float]($size * 0.81)

        $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 15, 23, 42))
        $pillPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $pr = $pillH / 2.0
        $pd = $pr * 2.0
        $pillPath.AddArc($pillX, $pillY, $pd, $pd, 180, 90)
        $pillPath.AddArc($pillX + $pillW - $pd, $pillY, $pd, $pd, 270, 90)
        $pillPath.AddArc($pillX + $pillW - $pd, $pillY + $pillH - $pd, $pd, $pd, 0, 90)
        $pillPath.AddArc($pillX, $pillY + $pillH - $pd, $pd, $pd, 90, 90)
        $pillPath.CloseFigure()
        $g.FillPath($pillBrush, $pillPath)
        $pillBrush.Dispose()

        $proPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 253, 224, 71), 1.0)
        $g.DrawPath($proPen, $pillPath)
        $proPen.Dispose()
        $pillPath.Dispose()

        $proFontSize = [int]($pillH * 0.65)
        $proFont = New-Object System.Drawing.Font("Arial", $proFontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $proBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71))
        $proFormat = New-Object System.Drawing.StringFormat
        $proFormat.Alignment = [System.Drawing.StringAlignment]::Center
        $proFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
        $proRect = New-Object System.Drawing.RectangleF($pillX, [float]($pillY + 0.5), $pillW, $pillH)
        $g.DrawString("PRO", $proFont, $proBrush, $proRect, $proFormat)
        $proBrush.Dispose()
        $proFont.Dispose()
        $proFormat.Dispose()
    }

    $g.Dispose()
    return $bmp
}

foreach ($entry in $mipmapDirs.GetEnumerator()) {
    $dirName = $entry.Key
    $size = $entry.Value
    $targetDir = Join-Path $baseResDir $dirName

    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    # Generate squircle launcher icon
    $squareBmp = Draw-Brand-Icon -size $size -isRound $false
    $launcherFile = Join-Path $targetDir "ic_launcher.png"
    $squareBmp.Save($launcherFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $squareBmp.Dispose()

    # Generate round launcher icon
    $roundBmp = Draw-Brand-Icon -size $size -isRound $true
    $roundFile = Join-Path $targetDir "ic_launcher_round.png"
    $roundBmp.Save($roundFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $roundBmp.Dispose()

    Write-Output "Successfully generated $dirName (${size}x${size}) squircle and round icons!"
}

# Also update the drawable copy if any
$drawableDirs = @("drawable-mdpi", "drawable-xhdpi", "drawable-xxhdpi", "drawable-xxxhdpi")
foreach ($dd in $drawableDirs) {
    $targetFile = Join-Path $baseResDir "$dd\src_assets_logo.png"
    if (Test-Path $targetFile) {
        Copy-Item "c:\helper\mobile\src\assets\logo.png" -Destination $targetFile -Force
        Write-Output "Updated $targetFile"
    }
}

Write-Output "ALL launcher and drawable icons generated with high precision!"
