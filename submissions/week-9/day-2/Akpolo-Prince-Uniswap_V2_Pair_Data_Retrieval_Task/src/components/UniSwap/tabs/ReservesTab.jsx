"use client"

import { useEffect, useRef } from "react"
import { ethers } from "ethers"

const ReservesTab = ({ token0Details, token1Details, reserve0, reserve1, formatNumber, prices }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    if (reserve0 && reserve1 && token0Details.decimals && token1Details.decimals && chartRef.current) {
      // Use a small delay to ensure the canvas is rendered
      const timer = setTimeout(() => {
        drawEnhancedChart()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [reserve0, reserve1, token0Details, token1Details])

  const drawEnhancedChart = () => {
    const canvas = chartRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate values and percentages
    const reserve0Value = Number.parseFloat(ethers.formatUnits(reserve0, token0Details.decimals))
    const reserve1Value = Number.parseFloat(ethers.formatUnits(reserve1, token1Details.decimals))
    const total = reserve0Value + reserve1Value

    const reserve0Percent = (reserve0Value / total) * 100
    const reserve1Percent = (reserve1Value / total) * 100

    // Colors
    const token0Color = "#ec4899" // Pink
    const token1Color = "#818cf8" // Indigo
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Draw pie chart with two separate slices
    // Token0 slice
    const token0StartAngle = 0
    const token0EndAngle = (Math.PI * 2 * reserve0Percent) / 100

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, token0StartAngle, token0EndAngle)
    ctx.fillStyle = token0Color
    ctx.fill()

    // Token1 slice
    const token1StartAngle = token0EndAngle
    const token1EndAngle = Math.PI * 2

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, token1StartAngle, token1EndAngle)
    ctx.fillStyle = token1Color
    ctx.fill()

    // Add center circle for donut effect
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = "#0f172a"
    ctx.fill()

    // Add text in center
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Reserves", centerX, centerY - 10)
    ctx.font = "12px Arial"
    ctx.fillText(`Total: ${(reserve0Value + reserve1Value).toLocaleString()}`, centerX, centerY + 10)

    // Add labels with percentages
    // Token0 label
    const token0LabelX = centerX - radius - 10
    const token0LabelY = centerY - 20
    ctx.fillStyle = token0Color
    ctx.beginPath()
    ctx.arc(token0LabelX - 15, token0LabelY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "right"
    ctx.fillText(`${token0Details.symbol}: ${reserve0Percent.toFixed(1)}%`, token0LabelX - 25, token0LabelY + 4)

    // Token1 label
    const token1LabelX = centerX - radius - 10
    const token1LabelY = centerY + 20
    ctx.fillStyle = token1Color
    ctx.beginPath()
    ctx.arc(token1LabelX - 15, token1LabelY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "right"
    ctx.fillText(`${token1Details.symbol}: ${reserve1Percent.toFixed(1)}%`, token1LabelX - 25, token1LabelY + 4)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      <div className="flex justify-center items-center">
        <canvas ref={chartRef} width="250" height="250"></canvas>
      </div>
      <div className="flex flex-col justify-center">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full mr-2"></div>
            <span className="text-sm">{token0Details.symbol}</span>
          </div>
          <p className="text-lg font-medium">{formatNumber(reserve0, token0Details.decimals)}</p>
        </div>
        <div>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
            <span className="text-sm">{token1Details.symbol}</span>
          </div>
          <p className="text-lg font-medium">{formatNumber(reserve1, token1Details.decimals)}</p>
        </div>
        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-800">
          <h4 className="text-sm text-gray-400 mb-2">Reserve Ratio</h4>
          <div className="flex justify-between">
            <span>1 {token0Details.symbol} =</span>
            <span className="font-medium text-pink-400">
              {prices.token0Price} {token1Details.symbol}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>1 {token1Details.symbol} =</span>
            <span className="font-medium text-indigo-400">
              {prices.token1Price} {token0Details.symbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservesTab

