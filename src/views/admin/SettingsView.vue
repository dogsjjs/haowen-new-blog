<template>
  <div class="settings-view">
    <el-form ref="settingsFormRef" :model="settingsForm" label-position="top" label-width="120px">
      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>博客基础设置</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="博客标题" prop="siteTitle">
              <el-input v-model="settingsForm.siteTitle" placeholder="请输入博客标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="博客副标题" prop="siteSubtitle">
              <el-input v-model="settingsForm.siteSubtitle" placeholder="请输入博客副标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="首页大图 URL" prop="heroImageUrl">
          <el-row :gutter="10" style="width: 100%;">
            <el-col :span="18">
              <el-input v-model="settingsForm.heroImageUrl" placeholder="请输入图片 URL 或通过下方按钮上传">
                <template #append>
                  <el-button @click="previewHeroImage" :disabled="!settingsForm.heroImageUrl">预览</el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-upload action="#" :show-file-list="false" :before-upload="beforeHeroImageUpload"
                :http-request="handleHeroImageUpload" class="image-uploader">
                <el-button type="primary">点击上传</el-button>
              </el-upload>
            </el-col>
          </el-row>
          <div v-if="settingsForm.heroImageUrl" class="image-preview-container">
            <el-image class="hero-image-preview" :src="settingsForm.heroImageUrl" fit="cover"
              :preview-src-list="[settingsForm.heroImageUrl]" hide-on-click-modal />
          </div>
          <div class="form-item-help">建议尺寸：1920x1080 或类似宽高比。可输入URL或上传图片。</div>
        </el-form-item>
      </el-card>

      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>个人信息设置</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="settingsForm.nickname" placeholder="请输入您的昵称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="头像 URL" prop="avatarUrl">
              <el-input v-model="settingsForm.avatarUrl" placeholder="请输入头像 URL 或通过右侧按钮上传"
                style="margin-bottom: 10px;" />
              <el-upload action="#" :show-file-list="false" :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload" class="avatar-uploader" list-type="picture-card">
                <el-icon v-if="!settingsForm.avatarUrl">
                  <Plus />
                </el-icon>
                <img v-if="settingsForm.avatarUrl" :src="settingsForm.avatarUrl" class="avatar-upload-preview"
                  alt="avatar" />
                <template #tip>
                  <div class="el-upload__tip">
                    点击上传头像
                  </div>
                </template>
              </el-upload>
              <div v-if="settingsForm.avatarUrl" class="avatar-preview-container">
                <!-- 预览已通过 el-upload 的 list-type="picture-card" 或下方 input 的 v-if 实现 -->
              </div>
              <div class="form-item-help">建议使用正方形图片。可输入URL或上传图片。</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="个人简介" prop="bio">
          <el-input type="textarea" :rows="3" v-model="settingsForm.bio" placeholder="简单介绍一下自己吧" />
        </el-form-item>
        <el-divider content-position="left">社交链接</el-divider>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="GitHub" prop="social.github">
              <el-input v-model="settingsForm.social.github" placeholder="例如: https://github.com/yourname" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="Email" prop="social.email">
              <el-input v-model="settingsForm.social.email" placeholder="例如: yourname@example.com" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="settings-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>其他设置</span>
          </div>
        </template>
        <el-form-item label="页脚信息" prop="footerInfo">
          <el-input type="textarea" :rows="2" v-model="settingsForm.footerInfo"
            placeholder="例如: © 2024 MyBlog. All rights reserved. | 京ICP备XXXXXXXX号" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="开启文章评论" prop="enableComments">
              <el-switch v-model="settingsForm.enableComments" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="站点统计 ID" prop="analyticsId">
              <el-input v-model="settingsForm.analyticsId" placeholder="例如: Google Analytics UA-XXXXX-Y" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-form-item style="margin-top: 20px;">
        <el-button type="primary" @click="saveSettings" :loading="isSaving">保存设置</el-button>
        <el-button @click="resetSettings">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus' // ElMessageBox for preview
import type { FormInstance, UploadProps, UploadRequestHandler, UploadRawFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface SocialLinks {
  github: string;
  email: string;
}

interface BlogSettings {
  siteTitle: string;
  siteSubtitle: string;
  heroImageUrl: string;
  avatarUrl: string;
  nickname: string;
  bio: string;
  social: SocialLinks;
  footerInfo: string;
  enableComments: boolean;
  analyticsId: string;
}

const settingsFormRef = ref<FormInstance>()
const isSaving = ref(false)

const initialSettings: BlogSettings = {
  siteTitle: '我的个人博客',
  siteSubtitle: '记录、分享、成长',
  heroImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  avatarUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  nickname: '博客主人',
  bio: '一位热爱探索和分享的技术爱好者。',
  social: {
    github: 'https://github.com/yourusername',
    email: 'your.email@example.com',
  },
  footerInfo: `© ${new Date().getFullYear()} MyBlog. 保留所有权利.`,
  enableComments: true,
  analyticsId: '',
}

const settingsForm = ref<BlogSettings>({ ...initialSettings })

// 模拟加载设置
const loadSettings = async () => {
  // 在实际应用中，这里会从 API 获取数据
  // try {
  //   const data = await fetch('/api/settings').then(res => res.json());
  //   settingsForm.value = { ...initialSettings, ...data };
  // } catch (error) {
  //   ElMessage.error('加载设置失败');
  //   settingsForm.value = { ...initialSettings };
  // }
  // 使用初始数据作为模拟
  settingsForm.value = JSON.parse(JSON.stringify(initialSettings)) // Deep copy
}

onMounted(() => {
  loadSettings()
})

const saveSettings = async () => {
  if (!settingsFormRef.value) return
  try {
    await settingsFormRef.value.validate()
    isSaving.value = true
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存的设置:', settingsForm.value)
    // 在实际应用中，这里会调用 API 保存数据
    // await fetch('/api/settings', { method: 'POST', body: JSON.stringify(settingsForm.value) });
    ElMessage.success('设置已成功保存！')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败，请检查表单项。')
  } finally {
    isSaving.value = false
  }
}

const resetSettings = () => {
  settingsForm.value = JSON.parse(JSON.stringify(initialSettings)) // Deep copy
  settingsFormRef.value?.clearValidate()
  ElMessage.info('设置已重置为默认值。')
}

const previewHeroImage = () => {
  if (settingsForm.value.heroImageUrl) {
    ElMessageBox.alert(`<img src="${settingsForm.value.heroImageUrl}" style="width: 100%; max-height: 70vh; object-fit: contain;" alt="首页大图预览"/>`, '首页大图预览', {
      dangerouslyUseHTMLString: true,
      showConfirmButton: false,
      center: true,
      customClass: 'image-preview-dialog'
    })
  } else {
    ElMessage.warning('请输入首页大图 URL 后再预览。')
  }
}

// --- 图片上传相关 ---

// 首页大图上传处理
const beforeHeroImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('图片格式不正确! (仅支持 JPG, PNG, GIF, WEBP)')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleHeroImageUpload: UploadRequestHandler = async (options) => {
  const file = options.file as UploadRawFile
  ElMessage.info(`首页大图 "${file.name}" 准备上传 (此处应调用API)`)
  // 实际上传逻辑:
  // const formData = new FormData()
  // formData.append('file', file)
  // try {
  //   const response = await fetch('/api/upload/hero-image', { method: 'POST', body: formData })
  //   if (!response.ok) throw new Error('Upload failed')
  //   const result = await response.json()
  //   settingsForm.value.heroImageUrl = result.url // 假设后端返回图片URL
  //   ElMessage.success('首页大图上传成功!')
  // } catch (error) {
  //   ElMessage.error('首页大图上传失败.')
  //   console.error('Hero image upload error:', error)
  // }
  // 模拟上传成功并设置URL
  settingsForm.value.heroImageUrl = URL.createObjectURL(file) // 本地预览，实际应为服务器返回的URL
  return Promise.resolve() // 必须返回 Promise
}

// 头像上传处理
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 可以复用 beforeHeroImageUpload 或单独定义规则
  return beforeHeroImageUpload(rawFile)
}

const handleAvatarUpload: UploadRequestHandler = async (options) => {
  const file = options.file as UploadRawFile
  ElMessage.info(`头像 "${file.name}" 准备上传 (此处应调用API)`)
  // 实际上传逻辑与 handleHeroImageUpload 类似，只是API端点和表单字段可能不同
  // ...
  // 模拟上传成功并设置URL
  settingsForm.value.avatarUrl = URL.createObjectURL(file) // 本地预览
  return Promise.resolve()
}


</script>

<style scoped lang="scss">
.settings-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color-lighter);

  :deep(.el-card__header) {
    background-color: var(--el-fill-color-light);
    font-weight: bold;
  }
}

.image-preview-container {
  margin-top: 10px;

  .hero-image-preview {
    width: 100%;
    max-height: 200px;
    min-height: 100px;
    /* Ensure some height even if image is small */
    border-radius: 4px;
    border: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-lighter);
    /* Placeholder bg */
    display: block;
    /* Ensure it takes full width if parent is flex */
  }
}

.avatar-preview-container {
  margin-top: 10px;
  /* 预览现在由 el-upload picture-card 模式处理 */
}

.image-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }
}

.avatar-uploader {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 110px;
    /* Adjust for icon centering */
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }

  .avatar-upload-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.form-item-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

:deep(.image-preview-dialog) {
  .el-message-box__content {
    padding: 10px;
  }

  .el-message-box__header {
    padding-bottom: 0;
  }
}
</style>