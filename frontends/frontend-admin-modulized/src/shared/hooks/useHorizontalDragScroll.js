import { useEffect } from "react"

export const useHorizontalDragScroll = (ref) => {
  useEffect(() => {
    const container = ref.current
    if (!container) return
    let isDown = false, isDragging = false, startX = 0, scrollLeft = 0

    const handleMouseDown = (e) => { isDown = true; isDragging = false; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft }
    const handleMouseLeave = () => { isDown = false }
    const handleMouseUp = () => { isDown = false; setTimeout(() => { isDragging = false }, 0) }
    const handleMouseMove = (e) => {
      if (!isDown) return
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 1.2
      if (Math.abs(walk) > 6) isDragging = true
      if (!isDragging) return
      e.preventDefault()
      container.scrollLeft = scrollLeft - walk
    }
    const handleClickCapture = (e) => { if (!isDragging) return; e.preventDefault(); e.stopPropagation() }

    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("click", handleClickCapture, true)

    return () => {
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("click", handleClickCapture, true)
    }
  }, [ref])
}

export default useHorizontalDragScroll
