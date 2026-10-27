Add-Type -AssemblyName System.Drawing

$width = 512
$height = 512
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Transparent background
$g.Clear([System.Drawing.Color]::Transparent)

# Outer glow / subtle ring
$glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 77, 45), 12)
$g.DrawEllipse($glowPen, 18, 18, 476, 476)
$glowPen.Dispose()

# Gradient circular badge background (Coral red to vibrant flame orange)
$rect = New-Object System.Drawing.Rectangle(24, 24, 464, 464)
$color1 = [System.Drawing.Color]::FromArgb(255, 255, 77, 45)   # #FF4D2D
$color2 = [System.Drawing.Color]::FromArgb(255, 230, 40, 15)   # #E6280F
$gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45.0)
$g.FillEllipse($gradientBrush, $rect)
$gradientBrush.Dispose()

# Inner thin gold/white accent ring
$innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), 4)
$g.DrawEllipse($innerPen, 40, 40, 432, 432)
$innerPen.Dispose()

# Big Bold "H" letter in center
$fontFamily = New-Object System.Drawing.FontFamily("Arial Black")
$font = New-Object System.Drawing.Font($fontFamily, 220, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

# Slight letter drop shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 0, 0, 0))
$shadowRect = New-Object System.Drawing.RectangleF(20, 30, 464, 464)
$g.DrawString("H", $font, $shadowBrush, $shadowRect, $stringFormat)
$shadowBrush.Dispose()

# Crisp white "H"
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$textRect = New-Object System.Drawing.RectangleF(18, 26, 464, 464)
$g.DrawString("H", $font, $whiteBrush, $textRect, $stringFormat)
$whiteBrush.Dispose()

# Golden Sparkle / Star (✦) on top-right of H
$sparkFont = New-Object System.Drawing.Font("Arial", 90, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71)) # #FDE047
$g.DrawString([char]0x2726, $sparkFont, $goldBrush, 320, 80)
$goldBrush.Dispose()
$sparkFont.Dispose()

# "PRO" pill badge at bottom
$pillRect = New-Object System.Drawing.Rectangle(196, 390, 120, 44)
$pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42)) # Deep navy
$pillPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$pillRadius = 22
$pillPath.AddArc($pillRect.X, $pillRect.Y, $pillRadius * 2, $pillRadius * 2, 180, 90)
$pillPath.AddArc($pillRect.Right - ($pillRadius * 2), $pillRect.Y, $pillRadius * 2, $pillRadius * 2, 270, 90)
$pillPath.AddArc($pillRect.Right - ($pillRadius * 2), $pillRect.Bottom - ($pillRadius * 2), $pillRadius * 2, $pillRadius * 2, 0, 90)
$pillPath.AddArc($pillRect.X, $pillRect.Bottom - ($pillRadius * 2), $pillRadius * 2, $pillRadius * 2, 90, 90)
$pillPath.CloseFigure()
$g.FillPath($pillBrush, $pillPath)
$pillBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 224, 71), 2)
$g.DrawPath($pillBorderPen, $pillPath)
$pillBorderPen.Dispose()
$pillBrush.Dispose()

$proFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$proBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71))
$proFormat = New-Object System.Drawing.StringFormat
$proFormat.Alignment = [System.Drawing.StringAlignment]::Center
$proFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$px = [float]$pillRect.X
$py = [float]($pillRect.Y + 2)
$pw = [float]$pillRect.Width
$ph = [float]$pillRect.Height
$proRectF = New-Object System.Drawing.RectangleF($px, $py, $pw, $ph)
$g.DrawString("PRO", $proFont, $proBrush, $proRectF, $proFormat)
$proBrush.Dispose()
$proFont.Dispose()

$font.Dispose()
$fontFamily.Dispose()
$stringFormat.Dispose()
$g.Dispose()

# Save as logo.png (overwriting old photo) and brand_logo.png
$outputPath1 = "c:\helper\mobile\src\assets\logo.png"
$outputPath2 = "c:\helper\mobile\src\assets\brand_logo.png"
$outputPath3 = "c:\helper\frontend\public\images\helper_logo.png"

$bmp.Save($outputPath1, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outputPath2, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outputPath3, [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
Write-Output "Successfully generated professional brand logo PNGs!"
