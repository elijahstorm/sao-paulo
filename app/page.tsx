"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Brush,
} from "recharts"
import { generateRandomData } from "./helpers/faker"

type ZoomType = {
	startIndex?: number
	endIndex?: number
}

type ZoomDataCallback = ({ startIndex, endIndex }: ZoomType) => void

const onZoom = (zoom: ZoomType) => {
	// do
}

export default function Home() {
	const [data, setData] = useState(generateRandomData(100))
	const [zoom, setZoom] = useState<ZoomType | null>(null)
	const [deltaAccumulatorY, setDeltaAccumulatorY] = useState(0)
	const [deltaAccumulatorX, setDeltaAccumulatorX] = useState(0)
	const graphRef = useRef<HTMLElement>(null)

	const [minValue, maxValue] = [0, data.length - 1]
	const { startIndex, endIndex } = (zoom ?? {
		startIndex: minValue,
		endIndex: maxValue,
	}) as { startIndex: number; endIndex: number }

	const handleBrushChange = useCallback<ZoomDataCallback>(
		(updatedZoom: ZoomType) => {
			if (onZoom) onZoom(updatedZoom)
		},
		[zoom, onZoom]
	)

	useEffect(() => {
		const graphElement = graphRef.current

		const handleWheel = (event) => {
			event.preventDefault()

			const zoomThreshold = 30
			const panThreshold = 50
			let accumulatedDeltaX = deltaAccumulatorX + event.deltaX
			let accumulatedDeltaY = deltaAccumulatorY + event.deltaY

			if (accumulatedDeltaX > panThreshold) {
				setZoom({
					...zoom,
					startIndex: Math.min(maxValue, startIndex + 1),
					endIndex: Math.min(maxValue, endIndex + 1),
				})
				accumulatedDeltaX = 0
			} else if (accumulatedDeltaX < -panThreshold) {
				setZoom({
					...zoom,
					startIndex: Math.max(minValue, startIndex - 1),
					endIndex: Math.max(minValue, endIndex - 1),
				})
				accumulatedDeltaX = 0
			}

			if (accumulatedDeltaY > zoomThreshold) {
				setZoom({
					...zoom,
					startIndex: Math.max(minValue, startIndex - 1),
					endIndex: Math.min(maxValue, endIndex + 1),
				})
				accumulatedDeltaY = 0
			} else if (accumulatedDeltaY < -zoomThreshold) {
				if (Math.abs(startIndex - endIndex) > 5) {
					setZoom({
						...zoom,
						startIndex: Math.min(data.length - 2, startIndex + 1),
						endIndex: Math.max(1, endIndex - 1),
					})
				}
				accumulatedDeltaY = 0
			}

			setDeltaAccumulatorX(accumulatedDeltaX)
			setDeltaAccumulatorY(accumulatedDeltaY)
		}

		graphElement?.addEventListener("wheel", handleWheel, { passive: false })

		return () => {
			graphElement?.removeEventListener("wheel", handleWheel)
		}
	}, [zoom, onZoom, deltaAccumulatorX, deltaAccumulatorY])

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main
				className="flex flex-col gap-8 row-start-2 items-center sm:items-start touch-none"
				ref={graphRef}
			>
				<LineChart
					width={500}
					height={300}
					data={data}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
					<Line type="monotone" dataKey="uv" stroke="#82ca9d" />
					<Brush
						stroke={"rgba(24, 106, 188, 0.6)"}
						height={30}
						dataKey={"date"}
						type="number"
						travellerWidth={15}
						gap={data.length / 100}
						tickFormatter={(value) =>
							new Date(value).toLocaleDateString("en-US", {
								day: "2-digit",
								month: "2-digit",
								year: "2-digit",
							})
						}
						onChange={handleBrushChange}
						startIndex={zoom?.startIndex}
						endIndex={zoom?.endIndex}
					/>
				</LineChart>
			</main>
		</div>
	)
}
