<template>
  <div class="photo-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>图片管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAddPhoto">新增图片</el-button>
        </div>
      </template>

      <el-table :data="photosAdmin" style="width: 100%" v-loading="loading">
        <el-table-column label="预览" width="120">
          <template #default="scope">
            <el-image style="width: 80px; height: 80px; border-radius: 4px;" :src="scope.row.url"
              :preview-src-list="[scope.row.url]" fit="cover" preview-teleported lazy />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="scope">
            <div class="description-cell">{{ scope.row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="180">
          <template #default="scope">
            {{ formatUploadTime(scope.row.uploadTime) }}
          </template>
        </el-table-column>
        <el-table-column label="是否展示" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isVisible" @change="handleVisibilityChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="Edit" @click="handleEditPhoto(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDeletePhoto(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑图片弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
        <el-form ref="photoFormRef" :model="currentPhotoForm" :rules="photoFormRules" label-width="100px">
          <el-form-item label="图片描述" prop="description">
            <el-input v-model="currentPhotoForm.description" type="textarea" :rows="3" placeholder="请输入图片描述" />
          </el-form-item>
          <el-form-item label="图片上传" prop="url">
            <!--
              实际项目中，这里会使用 el-upload 组件
              例如:
              <el-upload
                action="/api/upload/image" // 你的上传接口
                :on-success="handleImageUploadSuccess"
                :before-upload="beforeImageUpload"
                :show-file-list="false"
                list-type="picture-card"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传jpg/png文件，且不超过2MB
                  </div>
                </template>
              </el-upload>
              <el-input v-model="currentPhotoForm.url" placeholder="图片上传成功后会自动填充URL或手动输入" />
            -->
            <el-input v-model="currentPhotoForm.url" placeholder="请输入图片URL或上传后自动填充" />
            <div><small>提示：此处为图片URL输入框，实际项目中将替换为图片上传组件。</small></div>
            <el-image v-if="currentPhotoForm.url && isEditMode" :src="currentPhotoForm.url"
              style="max-width: 200px; margin-top: 10px;" fit="contain" />
          </el-form-item>
          <el-form-item label="是否展示" prop="isVisible">
            <el-switch v-model="currentPhotoForm.isVisible" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitPhotoForm">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

interface PhotoAdmin {
  id: number;
  url: string;
  description: string;
  uploadTime: Date;
  isVisible: boolean;
}

const loading = ref(false);
const photosAdmin = ref<PhotoAdmin[]>([
  { id: 1, url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg', description: '夜晚的城市灯光，绚丽多彩。', uploadTime: new Date('2023-01-15T10:00:00Z'), isVisible: true },
  { id: 2, url: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', description: '美味多汁的汉堡。', uploadTime: new Date('2023-02-20T14:30:00Z'), isVisible: false },
  { id: 3, url: 'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg', description: '森林中的小鹿。', uploadTime: new Date('2023-03-10T09:15:00Z'), isVisible: true },
]);

const dialogVisible = ref(false);
const isEditMode = ref(false);
const photoFormRef = ref<FormInstance>();

const initialPhotoFormState = (): Omit<PhotoAdmin, 'id' | 'uploadTime'> & { id?: number } => ({
  url: '',
  description: '',
  isVisible: true,
});

const currentPhotoForm = reactive(initialPhotoFormState());

const dialogTitle = computed(() => (isEditMode.value ? '编辑图片' : '新增图片'));

const photoFormRules = reactive<FormRules>({
  description: [{ required: true, message: '请输入图片描述', trigger: 'blur' }],
  url: [{ required: true, message: '请输入图片URL或上传图片', trigger: 'blur' }],
});

const formatUploadTime = (date: Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN', { hour12: false });
};

const resetForm = () => {
  Object.assign(currentPhotoForm, initialPhotoFormState());
  isEditMode.value = false;
  nextTick(() => {
    photoFormRef.value?.clearValidate();
  });
};

const handleAddPhoto = () => {
  resetForm();
  dialogVisible.value = true;
};

const handleEditPhoto = (photo: PhotoAdmin) => {
  resetForm();
  isEditMode.value = true;
  // Create a deep copy for editing to avoid direct mutation of the table data
  Object.assign(currentPhotoForm, JSON.parse(JSON.stringify(photo)));
  dialogVisible.value = true;
};

const handleVisibilityChange = (photo: PhotoAdmin) => {
  // In a real app, you would call an API here to update the visibility status
  ElMessage.success(`图片 "${photo.description.substring(0, 10)}..." 的展示状态已切换为 ${photo.isVisible ? '展示' : '隐藏'}`);
  // const index = photosAdmin.value.findIndex(p => p.id === photo.id);
  // if (index !== -1) {
  //   photosAdmin.value[index].isVisible = photo.isVisible;
  // }
};

const handleDeletePhoto = (photoId: number) => {
  ElMessageBox.confirm('确定要删除这张图片吗？此操作不可撤销。', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // In a real app, you would call an API here to delete the photo
      photosAdmin.value = photosAdmin.value.filter(p => p.id !== photoId);
      ElMessage.success('图片删除成功');
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

const submitPhotoForm = async () => {
  if (!photoFormRef.value) return;
  const valid = await photoFormRef.value.validate();
  if (valid) { // Explicitly check for true
    loading.value = true;
    // Simulate API call
    setTimeout(() => {
      if (isEditMode.value && currentPhotoForm.id) {
        // Update existing photo
        const index = photosAdmin.value.findIndex(p => p.id === currentPhotoForm.id);
        if (index !== -1) {
          photosAdmin.value[index] = { ...photosAdmin.value[index], ...currentPhotoForm } as PhotoAdmin;
        }
        ElMessage.success('图片更新成功');
      } else {
        // Add new photo
        const newPhoto: PhotoAdmin = {
          ...currentPhotoForm,
          id: Date.now(), // Simple ID generation for demo
          uploadTime: new Date(),
        } as PhotoAdmin; // Type assertion
        photosAdmin.value.unshift(newPhoto);
        ElMessage.success('图片新增成功');
      }
      loading.value = false;
      dialogVisible.value = false;
      resetForm();
    }, 500);
  } else {
    ElMessage.error('请检查表单填写是否正确');
    return false;
  }
};

// Placeholder for actual image upload handling
/*
const handleImageUploadSuccess = (response: any, file: UploadFile, fileList: UploadFiles) => {
  // Assuming the API returns the URL of the uploaded image in response.data.url
  if (response && response.data && response.data.url) {
    currentPhotoForm.url = response.data.url;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error('图片上传失败，未获取到URL');
  }
};

const beforeImageUpload = (rawFile: UploadRawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('图片必须是 JPG 或 PNG 格式!');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};
*/
</script>

<style scoped>
.photo-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description-cell {
  white-space: pre-wrap;
  /* Allows wrapping for long descriptions */
  word-break: break-word;
}

.el-table .el-image {
  cursor: pointer;
}

.dialog-footer {
  text-align: right;
}
</style>