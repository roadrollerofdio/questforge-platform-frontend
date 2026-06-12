/**
 * 内置虚拟形象部件库
 * 基础部件(肤色/发型/表情)免费可选; 装扮部件(帽子/眼镜/服饰/背景)需在宝石小店购买
 * svgKey 与后端 shop_item.svg_key 一一对应
 */

export interface AvatarConfig {
    skin: string
    hair: string
    face: string
    hat: string | null
    glasses: string | null
    outfit: string | null
    background: string | null
}

export const DEFAULT_AVATAR: AvatarConfig = {
    skin: 'skin_green',
    hair: 'hair_short',
    face: 'face_smile',
    hat: null,
    glasses: null,
    outfit: null,
    background: null
}

/** 肤色(身体颜色) */
export const SKIN_OPTIONS: { key: string; label: string; color: string }[] = [
    { key: 'skin_green', label: '青草绿', color: '#8EE000' },
    { key: 'skin_yellow', label: '柠檬黄', color: '#FFD43B' },
    { key: 'skin_blue', label: '天空蓝', color: '#4DC3FF' },
    { key: 'skin_pink', label: '蜜桃粉', color: '#FF9CCB' },
    { key: 'skin_purple', label: '葡萄紫', color: '#C39CFF' },
    { key: 'skin_orange', label: '活力橙', color: '#FFA94D' }
]

/** 发型 */
export const HAIR_OPTIONS: { key: string; label: string }[] = [
    { key: 'hair_none', label: '光头' },
    { key: 'hair_short', label: '短发' },
    { key: 'hair_curly', label: '卷发' },
    { key: 'hair_spiky', label: '冲天毛' },
    { key: 'hair_long', label: '长发' }
]

/** 表情 */
export const FACE_OPTIONS: { key: string; label: string }[] = [
    { key: 'face_smile', label: '微笑' },
    { key: 'face_happy', label: '大笑' },
    { key: 'face_wink', label: '眨眼' },
    { key: 'face_shy', label: '害羞' },
    { key: 'face_cool', label: '高冷' }
]

/** 装扮部件(对应商店 svg_key) */
export const DECOR_PARTS: Record<string, { slot: 'hat' | 'glasses' | 'outfit' | 'background'; name: string }> = {
    hat_cap: { slot: 'hat', name: '棒球帽' },
    hat_crown: { slot: 'hat', name: '国王皇冠' },
    hat_wizard: { slot: 'hat', name: '魔法师帽' },
    hat_party: { slot: 'hat', name: '派对帽' },
    gl_round: { slot: 'glasses', name: '圆框眼镜' },
    gl_sun: { slot: 'glasses', name: '酷炫墨镜' },
    gl_star: { slot: 'glasses', name: '星星眼镜' },
    outfit_scarf: { slot: 'outfit', name: '红色围巾' },
    outfit_bow: { slot: 'outfit', name: '绅士领结' },
    outfit_cape: { slot: 'outfit', name: '超人披风' },
    bg_stars: { slot: 'background', name: '星空背景' },
    bg_rainbow: { slot: 'background', name: '彩虹背景' },
    bg_clouds: { slot: 'background', name: '云朵背景' }
}

export const SLOT_LABELS: Record<string, string> = {
    hat: '帽子',
    glasses: '眼镜',
    outfit: '服饰',
    background: '背景'
}

/** 解析 avatarConfig JSON 字符串, 失败时回退默认形象 */
export function parseAvatarConfig(raw: string | object | null | undefined): AvatarConfig {
    if (!raw) return { ...DEFAULT_AVATAR }
    try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
        return { ...DEFAULT_AVATAR, ...obj }
    } catch (e) {
        return { ...DEFAULT_AVATAR }
    }
}

export function skinColor(key: string | undefined): string {
    const found = SKIN_OPTIONS.find(s => s.key === key)
    return found ? found.color : SKIN_OPTIONS[0].color
}
