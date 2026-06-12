<template>
  <svg :width="size" :height="size" viewBox="0 0 200 200" class="avatar-render select-none"
       :style="{ borderRadius: rounded ? '9999px' : '16px' }">
    <!-- ===== 背景层 ===== -->
    <g v-if="cfg.background === 'bg_stars'">
      <rect width="200" height="200" fill="#1E2A78"/>
      <circle cx="35" cy="40" r="4" fill="#FFE066"/>
      <circle cx="160" cy="30" r="3" fill="#FFF"/>
      <circle cx="175" cy="80" r="4" fill="#FFE066"/>
      <circle cx="25" cy="110" r="3" fill="#FFF"/>
      <circle cx="150" cy="160" r="3" fill="#FFE066"/>
      <path d="M95 18 l4 9 9 1 -7 7 2 10 -8 -5 -8 5 2 -10 -7 -7 9 -1 z" fill="#FFD43B"/>
    </g>
    <g v-else-if="cfg.background === 'bg_rainbow'">
      <rect width="200" height="200" fill="#D6F3FF"/>
      <path d="M0 200 A 100 100 0 0 1 200 200" fill="none" stroke="#FF4B4B" stroke-width="14"/>
      <path d="M14 200 A 86 86 0 0 1 186 200" fill="none" stroke="#FFC800" stroke-width="14"/>
      <path d="M28 200 A 72 72 0 0 1 172 200" fill="none" stroke="#58CC02" stroke-width="14"/>
      <path d="M42 200 A 58 58 0 0 1 158 200" fill="none" stroke="#1CB0F6" stroke-width="14"/>
    </g>
    <g v-else-if="cfg.background === 'bg_clouds'">
      <rect width="200" height="200" fill="#9ADCFF"/>
      <g fill="#FFFFFF">
        <ellipse cx="50" cy="50" rx="28" ry="16"/>
        <ellipse cx="72" cy="44" rx="20" ry="13"/>
        <ellipse cx="155" cy="90" rx="26" ry="14"/>
        <ellipse cx="138" cy="84" rx="18" ry="11"/>
        <ellipse cx="60" cy="160" rx="24" ry="13"/>
      </g>
    </g>
    <rect v-else width="200" height="200" :fill="fallbackBg"/>

    <!-- ===== 披风(在身体后面) ===== -->
    <g v-if="cfg.outfit === 'outfit_cape'">
      <path d="M48 110 Q 30 175 45 188 L 100 165 L 155 188 Q 170 175 152 110 Z" fill="#E53935"/>
      <path d="M48 110 Q 30 175 45 188 L 100 165 L 155 188 Q 170 175 152 110 Z" fill="none" stroke="#B71C1C" stroke-width="3"/>
    </g>

    <!-- ===== 身体 ===== -->
    <g>
      <ellipse cx="100" cy="118" rx="62" ry="66" :fill="bodyColor"/>
      <ellipse cx="100" cy="118" rx="62" ry="66" fill="none" :stroke="bodyShade" stroke-width="4"/>
      <!-- 肚皮 -->
      <ellipse cx="100" cy="145" rx="34" ry="28" fill="#FFFFFF" opacity="0.85"/>
      <!-- 小手 -->
      <ellipse cx="40" cy="135" rx="12" ry="16" :fill="bodyColor" :stroke="bodyShade" stroke-width="3" transform="rotate(20 40 135)"/>
      <ellipse cx="160" cy="135" rx="12" ry="16" :fill="bodyColor" :stroke="bodyShade" stroke-width="3" transform="rotate(-20 160 135)"/>
      <!-- 小脚 -->
      <ellipse cx="76" cy="182" rx="15" ry="9" fill="#FFB020"/>
      <ellipse cx="124" cy="182" rx="15" ry="9" fill="#FFB020"/>
    </g>

    <!-- ===== 表情 ===== -->
    <g>
      <!-- 眼睛 -->
      <g v-if="cfg.face === 'face_wink'">
        <circle cx="78" cy="98" r="9" fill="#2B2B2B"/>
        <circle cx="81" cy="95" r="3" fill="#FFF"/>
        <path d="M112 98 q 10 -8 20 0" stroke="#2B2B2B" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      <g v-else-if="cfg.face === 'face_cool'">
        <rect x="70" y="92" width="16" height="8" rx="4" fill="#2B2B2B"/>
        <rect x="114" y="92" width="16" height="8" rx="4" fill="#2B2B2B"/>
      </g>
      <g v-else>
        <circle cx="78" cy="98" r="9" fill="#2B2B2B"/>
        <circle cx="122" cy="98" r="9" fill="#2B2B2B"/>
        <circle cx="81" cy="95" r="3" fill="#FFF"/>
        <circle cx="125" cy="95" r="3" fill="#FFF"/>
      </g>

      <!-- 嘴巴 -->
      <path v-if="cfg.face === 'face_happy'" d="M82 118 q 18 22 36 0 q -18 10 -36 0" fill="#2B2B2B"/>
      <path v-else-if="cfg.face === 'face_cool'" d="M88 124 h 24" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path v-else-if="cfg.face === 'face_shy'" d="M92 122 q 8 6 16 0" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path v-else d="M86 118 q 14 14 28 0" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round" fill="none"/>

      <!-- 腮红 -->
      <g v-if="cfg.face === 'face_shy' || cfg.face === 'face_happy'">
        <ellipse cx="62" cy="114" rx="9" ry="6" fill="#FF8FA3" opacity="0.8"/>
        <ellipse cx="138" cy="114" rx="9" ry="6" fill="#FF8FA3" opacity="0.8"/>
      </g>
    </g>

    <!-- ===== 服饰(身前) ===== -->
    <g v-if="cfg.outfit === 'outfit_scarf'">
      <path d="M52 138 Q 100 162 148 138 L 144 152 Q 100 174 56 152 Z" fill="#E53935"/>
      <rect x="120" y="146" width="16" height="30" rx="6" fill="#E53935" transform="rotate(-12 128 160)"/>
      <rect x="120" y="170" width="16" height="6" rx="3" fill="#B71C1C" transform="rotate(-12 128 173)"/>
    </g>
    <g v-else-if="cfg.outfit === 'outfit_bow'">
      <path d="M100 142 l -20 -11 v 22 z" fill="#3F51B5"/>
      <path d="M100 142 l 20 -11 v 22 z" fill="#3F51B5"/>
      <circle cx="100" cy="142" r="6" fill="#283593"/>
    </g>

    <!-- ===== 眼镜 ===== -->
    <g v-if="cfg.glasses === 'gl_round'">
      <circle cx="78" cy="98" r="15" fill="none" stroke="#2B2B2B" stroke-width="4"/>
      <circle cx="122" cy="98" r="15" fill="none" stroke="#2B2B2B" stroke-width="4"/>
      <path d="M93 98 h 14" stroke="#2B2B2B" stroke-width="4"/>
    </g>
    <g v-else-if="cfg.glasses === 'gl_sun'">
      <rect x="62" y="86" width="32" height="22" rx="8" fill="#222" opacity="0.92"/>
      <rect x="106" y="86" width="32" height="22" rx="8" fill="#222" opacity="0.92"/>
      <path d="M94 95 h 12" stroke="#222" stroke-width="5"/>
      <path d="M68 92 l 8 -3" stroke="#FFF" stroke-width="3" opacity="0.6"/>
    </g>
    <g v-else-if="cfg.glasses === 'gl_star'">
      <path d="M78 84 l4.5 9.5 10.5 1.2 -7.8 7.2 2.1 10.4 -9.3 -5.4 -9.3 5.4 2.1 -10.4 -7.8 -7.2 10.5 -1.2 z" fill="#FFC800" stroke="#E6A800" stroke-width="2"/>
      <path d="M122 84 l4.5 9.5 10.5 1.2 -7.8 7.2 2.1 10.4 -9.3 -5.4 -9.3 5.4 2.1 -10.4 -7.8 -7.2 10.5 -1.2 z" fill="#FFC800" stroke="#E6A800" stroke-width="2"/>
      <path d="M93 96 h 14" stroke="#E6A800" stroke-width="4"/>
    </g>

    <!-- ===== 发型 ===== -->
    <g v-if="cfg.hair === 'hair_short'">
      <path d="M58 72 Q 100 38 142 72 Q 128 56 100 56 Q 72 56 58 72" fill="#6D4C41"/>
    </g>
    <g v-else-if="cfg.hair === 'hair_curly'">
      <circle cx="72" cy="62" r="13" fill="#4E342E"/>
      <circle cx="95" cy="54" r="14" fill="#4E342E"/>
      <circle cx="119" cy="58" r="13" fill="#4E342E"/>
      <circle cx="136" cy="70" r="10" fill="#4E342E"/>
      <circle cx="58" cy="74" r="9" fill="#4E342E"/>
    </g>
    <g v-else-if="cfg.hair === 'hair_spiky'">
      <path d="M66 70 l 6 -22 8 18 8 -26 10 24 8 -22 10 22 8 -16 6 22 Q 100 48 66 70" fill="#37474F"/>
    </g>
    <g v-else-if="cfg.hair === 'hair_long'">
      <path d="M55 70 Q 100 36 145 70 L 150 130 Q 142 122 138 100 Q 132 64 100 60 Q 68 64 62 100 Q 58 122 50 130 Z" fill="#8D6E63"/>
    </g>

    <!-- ===== 帽子 ===== -->
    <g v-if="cfg.hat === 'hat_cap'">
      <path d="M62 64 Q 100 30 138 64 L 138 70 L 62 70 Z" fill="#1CB0F6"/>
      <path d="M134 64 q 28 -4 32 8 q -16 4 -34 2 z" fill="#1592CC"/>
      <circle cx="100" cy="42" r="6" fill="#0E7FB5"/>
    </g>
    <g v-else-if="cfg.hat === 'hat_crown'">
      <path d="M68 66 L 68 40 L 84 54 L 100 34 L 116 54 L 132 40 L 132 66 Z" fill="#FFC800" stroke="#E6A800" stroke-width="3"/>
      <circle cx="68" cy="38" r="5" fill="#FF4B4B"/>
      <circle cx="100" cy="31" r="5" fill="#1CB0F6"/>
      <circle cx="132" cy="38" r="5" fill="#58CC02"/>
    </g>
    <g v-else-if="cfg.hat === 'hat_wizard'">
      <path d="M64 68 L 100 8 L 136 68 Z" fill="#7E57C2"/>
      <path d="M58 68 Q 100 78 142 68 L 142 74 Q 100 86 58 74 Z" fill="#5E35B1"/>
      <path d="M97 30 l3 7 7 .8 -5.2 4.8 1.4 7 -6.2 -3.6 -6.2 3.6 1.4 -7 -5.2 -4.8 7 -.8 z" fill="#FFE066"/>
    </g>
    <g v-else-if="cfg.hat === 'hat_party'">
      <path d="M78 64 L 100 14 L 122 64 Z" fill="#FF4B4B"/>
      <path d="M84 50 q 16 8 30 -2" stroke="#FFE066" stroke-width="5" fill="none"/>
      <circle cx="100" cy="13" r="7" fill="#FFC800"/>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseAvatarConfig, skinColor } from '@/avatar/parts'

const props = withDefaults(defineProps<{
  config?: string | object | null
  size?: number
  rounded?: boolean
}>(), {
  config: null,
  size: 48,
  rounded: true
})

const cfg = computed(() => parseAvatarConfig(props.config))
const bodyColor = computed(() => skinColor(cfg.value.skin))

const fallbackBg = computed(() => {
  // 无背景装扮时给柔和底色
  return '#EFF6E9'
})

const bodyShade = computed(() => {
  // 身体描边取主体色加深
  const hex = bodyColor.value.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, (num >> 16) - 50)
  const g = Math.max(0, ((num >> 8) & 0xff) - 50)
  const b = Math.max(0, (num & 0xff) - 50)
  return `rgb(${r},${g},${b})`
})
</script>

<style scoped>
.avatar-render {
  display: block;
  overflow: hidden;
}
</style>
