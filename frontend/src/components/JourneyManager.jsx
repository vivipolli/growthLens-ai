import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Card, Button } from './index'
import Dashboard from './Dashboard'
import { useNavigate } from 'react-router-dom'

const JourneyManager = () => {
    const [showDashboard, setShowDashboard] = useState(true)
    const { gradients } = useTheme()
    const navigate = useNavigate()

    // Only show dashboard/overview here
    return <Dashboard onEditPersonal={() => navigate('/onboarding/personal')} onEditBusiness={() => navigate('/onboarding/business')} />
}

export default JourneyManager 