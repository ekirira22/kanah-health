// Database types
export interface User {
  id: string
  phone_number: string
  full_name: string
  email: string
  user_type: 'mother' | 'health_worker' | 'admin'
  email_verified: boolean
  latitude: number | null
  longitude: number | null
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
  created_at: string
  updated_at: string
}

export interface Baby {
  id: string
  mother_id: string
  birth_date: string
  baby_number: number // For twins/triplets (1, 2, 3, etc.)
  created_at: string
  updated_at: string
}

export interface HealthWorker {
  id: string
  user_id: string
  worker_type: 'doctor' | 'nurse' | 'community_health_worker' | 'midwife'
  available_for_visits: boolean
  available_for_calls: boolean
  max_daily_visits: number
  avg_rating: number
  reviews: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  mother_id: string
  health_worker_id: string | null
  appointment_type: 'video_call' | 'visitation' | null
  status: 'unconfirmed' | 'scheduled' | 'in_progress' | 'completed' | 'canceled'
  location: string | null
  scheduled_time: string | null
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_amount: number
  payment_reference: string
  scheduled_duration_minutes: number | null
  notes: string | null
  link: string | null
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
