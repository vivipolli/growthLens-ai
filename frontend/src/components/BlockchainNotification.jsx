import React, { useState, useEffect } from 'react'

const BlockchainNotification = ({
    isVisible,
    transactionId,
    hashscanUrl,
    onClose,
    onContinue,
    title = "Data Saved to Blockchain",
    duration = 12000 // 12 seconds
}) => {
    const [isShowing, setIsShowing] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setIsShowing(true)

            // Auto-hide after duration
            const timer = setTimeout(() => {
                handleClose()
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [isVisible, duration])

    const handleClose = () => {
        setIsShowing(false)
        setTimeout(() => {
            onClose()
        }, 300) // Wait for animation to complete
    }

    const handleViewTransaction = () => {
        if (hashscanUrl) {
            window.open(hashscanUrl, '_blank', 'noopener,noreferrer')
        }
    }

    const handleContinue = () => {
        if (onContinue) {
            onContinue()
        }
        handleClose()
    }

    if (!isVisible) return null

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg shadow-lg p-4 max-w-md min-w-80">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                        <div className="bg-white/20 rounded-full p-1 mr-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-sm">{title}</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="text-sm mb-3">
                    <p className="text-white/90 mb-2">
                        Your data has been securely stored on the Hedera blockchain.
                    </p>
                    {transactionId && (
                        <div className="bg-black/20 rounded p-2 mb-2">
                            <p className="text-xs text-white/70 mb-1">Transaction ID:</p>
                            <p className="font-mono text-xs break-all text-white">
                                {transactionId}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {hashscanUrl && (
                        <button
                            onClick={handleViewTransaction}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            HashScan
                        </button>
                    )}
                    {onContinue && (
                        <button
                            onClick={handleContinue}
                            className="flex-1 bg-white text-green-600 px-4 py-2 rounded text-sm font-medium transition-colors hover:bg-gray-100 flex items-center justify-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Continue
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="bg-white/20 hover:bg-white/30 text-white px-2 py-2 rounded text-sm font-medium transition-colors"
                    >
                        Later
                    </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 bg-white/20 rounded-full h-1 overflow-hidden">
                    <div
                        className="bg-white h-full transition-all duration-300 ease-linear"
                        style={{
                            width: isShowing ? '0%' : '100%',
                            animation: isShowing ? `shrink ${duration}ms linear` : 'none'
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    )
}

export default BlockchainNotification