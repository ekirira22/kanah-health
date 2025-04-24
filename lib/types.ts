// Database types
export interface User {
  id: string
  phone_number: string
  full_name: string
  email: string
  user_type: 'mother'
  created_at: string
  updated_at: string
}

export interface Mother {
  id: string
  user_id: string
  birth_type: 'vaginal' | 'c_section'
  subscription_status: 'free' | 'premium'
  subscription_end_date: string | null
  language_preference: 'english' | 'swahili'
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export interface Baby {
  id: string
  mother_id: string
  birth_date: string
  created_at: string
  updated_at: string
}

export interface HealthWorker {
  id: string
  user_id: string
  worker_type: string
  available_for_visits: boolean
  available_for_calls: boolean
  latitude: number | null
  longitude: number | null
  max_daily_visits: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  mother_id: string
  health_worker_id: string
  appointment_type: string
  status: string
  scheduled_time: string
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_amount: number
  payment_reference: string | null
  scheduled_duration_minutes: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HealthTip {
  id: string
  title: string
  content: string
  content_type: string
  video_url: string | null
  category: string
  applicable_birth_type: string
  applicable_days_postpartum_min: number
  applicable_days_postpartum_max: number
  language: string
  premium_content: boolean
  created_at: string
  updated_at: string
}

export interface AutomatedReminder {
  id: string
  title: string
  message: string
  category: string
  applicable_birth_type: string
  days_postpartum: number
  language: string
  created_at: string
  updated_at: string
}

export interface MotherReminder {
  id: string
  mother_id: string
  reminder_id: string
  scheduled_time: string
  sent: boolean
  created_at: string
  updated_at: string
}

export interface SymptomCheck {
  id: string
  mother_id: string
  subject: string
  symptom_description: string
  severity_level: string
  recommendation: string | null
  recommended_action: string
  created_at: string
  updated_at: string
}

export interface Advertisement {
  id: string
  brand_name: string
  content: string
  image_url: string | null
  active: boolean
  language: string
  created_at: string
  updated_at: string
}
