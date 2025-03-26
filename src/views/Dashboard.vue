<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useToast } from 'vue-toastification'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

import VueCircleProgress from 'vue3-circle-progress'

const toast = useToast()
const router = useRouter()
const showMobileMenu = ref(false)
const progress = ref(75)
const userData = ref({
  length: 39.9,
  weight: 1.32,
  name: '',
  email: '',
  avatar: '',
  isAdmin: false,
  isActive: false,
  isVerified: false,
})

const handleLogout = async () => {
  try{
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push('/login')
  }catch(error) {
    toast.error(`Error logging out: ${error.message}`)
  }
}

onMounted(async () => {
  const { data:profileData, error } = await supabase.auth.getSession()
  console.log(profileData)
    
  userData.value.name = profileData?.session.user.user_metadata.name
  userData.value.email = profileData?.session.user.email
  userData.value.isVerified = profileData?.session.user.user_metadata.email_verified

  const firstName = profileData.session.user.user_metadata.name?.split(" ")[0];

  if (error) toast.error(error.message)
  // else toast.success(`Welcome to your Dashboard ${firstName}`)

})

</script>
<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Desktop Sidebar - hidden on mobile -->
    <aside class="hidden md:flex flex-col w-64 bg-white border-r">
      <div class="p-4">
        <h1 class="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <nav class="flex-1 p-4">
        <div class="space-y-2">
          <router-link to="/profile" class="flex items-center p-2 hover:bg-gray-100 rounded-lg">
            <UserIcon class="w-5 h-5 mr-3" />
            Profile
          </router-link>
          <router-link to="/settings" class="flex items-center p-2 hover:bg-gray-100 rounded-lg">
            <Cog6ToothIcon class="w-5 h-5 mr-3" />
            Settings
          </router-link>
          <button @click="handleLogout" class="flex items-center p-2 w-full hover:bg-gray-100 rounded-lg text-red-500">
            <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="bg-white border-b p-4 flex justify-between items-center">
        <div class="flex items-center justify-between">
          <!-- <div class="flex items-center md:hidden">
            <h1 class="text-xl font-bold">Dashboard --</h1>
          </div> -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search" class="pl-10 pr-4 py-2 border rounded-lg w-full">
            </div>
            <BellIcon class="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <h1 class="text-2xl font-bold">Hi, {{ userData.name.split(" ")[0] }}</h1>
      </header>

      <!-- Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-4">
        <!-- Progress Circle -->
        <div class="bg-white rounded-lg p-6 mb-6">
          <div class="relative w-48 h-48 mx-auto">
            <!-- Replace with actual progress circle component -->
            <div class="absolute inset-0 flex items-center justify-center" id="content">
              <div class="text-center">
                <div class="text-lg font-bold">Length</div>
                <div class="text-orange-500 text-2xl">{{ userData.length }}</div>
                <div class="text-gray-500">Weight: {{ userData.weight }}</div>
              </div>
            </div>
            <VueCircleProgress
              :percent="progress"
              :size="200"
              :border-width="20"
              :border-bg-width="20"
              empty-color="#E5E7EB"
              :fill-color="['#F97316']"
            >
              <template #content>
              </template>
            </VueCircleProgress>
          </div>
        </div>

        <!-- Quick Access -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4">Quick access</h2>
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-lg text-center">
              <div class="bg-blue-100 p-2 rounded-full w-12 h-12 mx-auto mb-2">
                <UserIcon class="w-8 h-8 text-blue-500" />
              </div>
              <span class="text-sm">My Plan</span>
            </div>
            <div class="bg-white p-4 rounded-lg text-center">
              <div class="bg-yellow-100 p-2 rounded-full w-12 h-12 mx-auto mb-2">
                <UserIcon class="w-8 h-8 text-yellow-500" />
              </div>
              <span class="text-sm">Consultations</span>
            </div>
            <div class="bg-white p-4 rounded-lg text-center">
              <div class="bg-green-100 p-2 rounded-full w-12 h-12 mx-auto mb-2">
                <UserIcon class="w-8 h-8 text-green-500" />
              </div>
              <span class="text-sm">Resources</span>
            </div>
            <div class="bg-white p-4 rounded-lg text-center">
              <div class="bg-pink-100 p-2 rounded-full w-12 h-12 mx-auto mb-2">
                <UserIcon class="w-8 h-8 text-pink-500" />
              </div>
              <span class="text-sm">Community</span>
            </div>
          </div>
        </div>

        <!-- Reminders -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Reminders</h2>
          <div class="space-y-4">
            <div class="bg-white p-4 rounded-lg flex items-center gap-4">
              <div class="bg-orange-500 rounded-full p-2">
                <UserIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="font-semibold">Drink 3 glass of water</h3>
                <p class="text-sm text-gray-500">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
              </div>
            </div>
            <div class="bg-white p-4 rounded-lg flex items-center gap-4">
              <div class="bg-orange-500 rounded-full p-2">
                <UserIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="font-semibold">Drink 3 glass of water</h3>
                <p class="text-sm text-gray-500">Lorem ipsum is simply dummy text of the printing and typesetting industry.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div class="flex justify-around p-4">
          <router-link to="/my-plan" class="flex flex-col items-center">
            <UserIcon class="w-6 h-6 text-gray-500" />
            <span class="text-xs">My Plan</span>
          </router-link>
          <router-link to="/consultations" class="flex flex-col items-center">
            <UserIcon class="w-6 h-6 text-gray-500" />
            <span class="text-xs">Consultations</span>
          </router-link>
          <router-link to="/resources" class="flex flex-col items-center">
            <UserIcon class="w-6 h-6 text-gray-500" />
            <span class="text-xs">Resources</span>
          </router-link>
          <button @click="showMobileMenu = !showMobileMenu" class="flex flex-col items-center">
            <EllipsisVerticalIcon class="w-6 h-6 text-gray-500" />
            <span class="text-xs">More</span>
          </button>
        </div>

        <!-- Mobile Menu Popup -->
        <div v-if="showMobileMenu" 
             class="absolute bottom-full right-4 mb-2 bg-white rounded-lg shadow-lg border p-2 w-48">
          <router-link to="/profile" class="flex items-center p-2 hover:bg-gray-100 rounded-lg">
            <UserIcon class="w-5 h-5 mr-3" />
            Profile
          </router-link>
          <router-link to="/settings" class="flex items-center p-2 hover:bg-gray-100 rounded-lg">
            <Cog6ToothIcon class="w-5 h-5 mr-3" />
            Settings
          </router-link>
          <button @click="handleLogout" class="flex items-center p-2 w-full hover:bg-gray-100 rounded-lg text-red-500">
            <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  </div>
</template> 