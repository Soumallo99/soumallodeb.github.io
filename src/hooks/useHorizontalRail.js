import { useCallback, useEffect, useRef, useState } from 'react'

const WHEEL_IDLE_MS = 150
const WHEEL_EASE = 0.2

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export default function useHorizontalRail(reducedMotion = false) {
  const railRef = useRef(null)
  const itemRefs = useRef([])
  const activeIndexRef = useRef(0)
  const scrollFrameRef = useRef(0)
  const wheelFrameRef = useRef(0)
  const pageFrameRef = useRef(0)
  const snapTimerRef = useRef(0)
  const wheelTargetRef = useRef(null)
  const settlingWheelRef = useRef(false)
  const pageTargetRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const registerItem = useCallback((index, node) => {
    itemRefs.current[index] = node
  }, [])

  const getNearestIndex = useCallback(() => {
    const rail = railRef.current
    if (!rail) return 0

    const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    itemRefs.current.forEach((item, index) => {
      if (!item) return
      const rect = item.getBoundingClientRect()
      const distance = Math.abs(rect.left + rect.width / 2 - railCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    return nearestIndex
  }, [])

  const stopWheelMotion = useCallback(() => {
    const rail = railRef.current
    if (wheelFrameRef.current) window.cancelAnimationFrame(wheelFrameRef.current)
    wheelFrameRef.current = 0
    wheelTargetRef.current = null
    settlingWheelRef.current = false
    window.clearTimeout(snapTimerRef.current)
    snapTimerRef.current = 0
    rail?.removeAttribute('data-wheel-scrolling')
  }, [])

  const stopPageMotion = useCallback(() => {
    if (pageFrameRef.current) window.cancelAnimationFrame(pageFrameRef.current)
    pageFrameRef.current = 0
    pageTargetRef.current = null
  }, [])

  const scrollToIndex = useCallback((index) => {
    const rail = railRef.current
    const item = itemRefs.current[index]
    if (!rail || !item) return

    stopWheelMotion()
    stopPageMotion()

    const railRect = rail.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const centerOffset = (rail.clientWidth - itemRect.width) / 2
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
    const targetLeft = rail.scrollLeft + itemRect.left - railRect.left - centerOffset
    const left = clamp(targetLeft, 0, maxScroll)
    rail.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [reducedMotion, stopPageMotion, stopWheelMotion])

  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current)
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const nearestIndex = getNearestIndex()
      activeIndexRef.current = nearestIndex
      setActiveIndex((current) => current === nearestIndex ? current : nearestIndex)
      scrollFrameRef.current = 0
    })
  }, [getNearestIndex])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      scrollToIndex(activeIndexRef.current + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      scrollToIndex(activeIndexRef.current - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      scrollToIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      scrollToIndex(itemRefs.current.length - 1)
    }
  }, [scrollToIndex])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined

    function setPageScroll(top) {
      const scrollingElement = document.scrollingElement || document.documentElement
      scrollingElement.scrollTop = top
    }

    function animatePage() {
      const target = pageTargetRef.current
      if (target === null) {
        pageFrameRef.current = 0
        return
      }

      const distance = target - window.scrollY
      if (Math.abs(distance) <= 0.6) {
        setPageScroll(target)
        pageTargetRef.current = null
        pageFrameRef.current = 0
        return
      }

      setPageScroll(window.scrollY + distance * 0.22)
      pageFrameRef.current = window.requestAnimationFrame(animatePage)
    }

    function handoffToPage(event) {
      event.preventDefault()
      stopWheelMotion()

      const unitScale = event.deltaMode === 1
        ? 34
        : event.deltaMode === 2
          ? window.innerHeight * 0.85
          : 1.65
      const maxStep = Math.max(160, Math.min(window.innerHeight * 0.8, 520))
      const distance = clamp(event.deltaY * unitScale, -maxStep, maxStep)
      const pageMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const currentPage = pageTargetRef.current ?? window.scrollY
      pageTargetRef.current = clamp(currentPage + distance, 0, pageMax)

      if (!pageFrameRef.current) pageFrameRef.current = window.requestAnimationFrame(animatePage)
    }

    function animateWheel() {
      const target = wheelTargetRef.current
      if (target === null) {
        wheelFrameRef.current = 0
        return
      }

      const distance = target - rail.scrollLeft
      if (Math.abs(distance) <= 0.6) {
        rail.scrollLeft = target
        if (settlingWheelRef.current) {
          wheelTargetRef.current = null
          settlingWheelRef.current = false
          rail.removeAttribute('data-wheel-scrolling')
        }
        wheelFrameRef.current = 0
        return
      }

      rail.scrollLeft += distance * WHEEL_EASE
      wheelFrameRef.current = window.requestAnimationFrame(animateWheel)
    }

    function finishWheelGesture() {
      if (wheelTargetRef.current === null) return
      snapTimerRef.current = 0

      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
      const target = wheelTargetRef.current
      const edgeTarget = target <= 1 ? 0 : target >= maxScroll - 1 ? maxScroll : null
      if (edgeTarget !== null) {
        if (reducedMotion) {
          rail.scrollLeft = edgeTarget
          wheelTargetRef.current = null
          rail.removeAttribute('data-wheel-scrolling')
          return
        }
        wheelTargetRef.current = edgeTarget
        settlingWheelRef.current = true
        if (!wheelFrameRef.current) wheelFrameRef.current = window.requestAnimationFrame(animateWheel)
        return
      }

      if (wheelFrameRef.current) window.cancelAnimationFrame(wheelFrameRef.current)
      wheelFrameRef.current = 0
      wheelTargetRef.current = null
      settlingWheelRef.current = false
      rail.removeAttribute('data-wheel-scrolling')
      scrollToIndex(getNearestIndex())
    }

    function handleWheel(event) {
      const verticalDominant = Math.abs(event.deltaY) > Math.abs(event.deltaX)
      if (!event.deltaY || !verticalDominant) {
        if (event.deltaX) {
          stopWheelMotion()
          stopPageMotion()
        }
        return
      }

      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
      const direction = Math.sign(event.deltaY)
      const currentTarget = wheelTargetRef.current ?? rail.scrollLeft
      const atStart = direction < 0 && currentTarget <= 1
      const atEnd = direction > 0 && currentTarget >= maxScroll - 1

      // Once the rail has no useful horizontal distance left, transfer the same
      // wheel gesture to the document instead of making the user scroll again.
      if (maxScroll <= 0 || atStart || atEnd) {
        if (maxScroll > 0) {
          rail.scrollLeft = atStart ? 0 : maxScroll
        }
        handoffToPage(event)
        return
      }

      stopPageMotion()
      settlingWheelRef.current = false
      event.preventDefault()

      if (wheelTargetRef.current === null) {
        // Interrupt a previous smooth snap before accepting a new gesture.
        rail.scrollLeft = rail.scrollLeft
        window.clearTimeout(snapTimerRef.current)
        snapTimerRef.current = 0
        rail.setAttribute('data-wheel-scrolling', 'true')
        wheelTargetRef.current = rail.scrollLeft
        if (!reducedMotion) wheelFrameRef.current = window.requestAnimationFrame(animateWheel)
      }

      const unitScale = event.deltaMode === 1
        ? 34
        : event.deltaMode === 2
          ? rail.clientWidth * 0.85
          : 1.65
      const maxStep = Math.max(140, Math.min(rail.clientWidth * 0.58, 460))
      const distance = clamp(event.deltaY * unitScale, -maxStep, maxStep)
      wheelTargetRef.current = clamp(wheelTargetRef.current + distance, 0, maxScroll)

      if (reducedMotion) {
        rail.scrollLeft = wheelTargetRef.current
      }

      window.clearTimeout(snapTimerRef.current)
      snapTimerRef.current = window.setTimeout(finishWheelGesture, WHEEL_IDLE_MS)
    }

    rail.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      rail.removeEventListener('wheel', handleWheel)
      stopWheelMotion()
      stopPageMotion()
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = 0
    }
  }, [getNearestIndex, reducedMotion, scrollToIndex, stopPageMotion, stopWheelMotion])

  return {
    railRef,
    itemRefs,
    activeIndex,
    registerItem,
    handleScroll,
    handleKeyDown,
    scrollToIndex,
  }
}
