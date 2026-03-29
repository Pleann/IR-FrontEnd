<script setup>
import { ref, onMounted } from "vue";
import { getFolders, createFolder, renameFolder, deleteFolder } from "../services/api";

const folders = ref([]);
const newFolderName = ref("");
const editingFolder = ref(null);  // { folder_id, folder_name }
const editName = ref("");
const error = ref("");

async function loadFolders() {
  folders.value = await getFolders();
}

async function handleCreate() {
  if (!newFolderName.value.trim()) return;
  const res = await createFolder(newFolderName.value.trim());
  if (res.detail) {
    error.value = res.detail;
    return;
  }
  newFolderName.value = "";
  error.value = "";
  await loadFolders();
}

function startEdit(folder) {
  editingFolder.value = folder;
  editName.value = folder.folder_name;
}

async function handleRename() {
  if (!editingFolder.value || !editName.value.trim()) return; 
  await renameFolder(editingFolder.value.folder_id, editName.value.trim());
  editingFolder.value = null;
  await loadFolders();
}

async function handleDelete(folderId) {
  if (!confirm("Delete this folder? Bookmarks will be kept but unfoldered.")) return;
  await deleteFolder(folderId);
  await loadFolders();
}

onMounted(loadFolders);
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">My Folders</h1>

    <!-- Create folder -->
    <div class="flex gap-2 mb-6">
      <input
        v-model="newFolderName"
        @keyup.enter="handleCreate"
        type="text"
        placeholder="New folder name..."
        class="flex-1 border px-3 py-2 rounded"
      />
      <button
        @click="handleCreate"
        class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Create
      </button>
    </div>
    <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

    <!-- Folder list -->
    <div v-if="folders.length === 0" class="text-gray-400 text-center py-12">
      No folders yet. Create one above.
    </div>

    <ul class="space-y-3">
      <li
        v-for="folder in folders"
        :key="folder.folder_id"
        class="flex items-center justify-between border rounded px-4 py-3"
      >
        <!-- Rename inline -->
        <div v-if="editingFolder?.folder_id === folder.folder_id" class="flex gap-2 flex-1">
          <input
            v-model="editName"
            @keyup.enter="handleRename"
            class="border px-2 py-1 rounded flex-1"
          />
          <button @click="handleRename" class="text-green-600 hover:underline text-sm">Save</button>
          <button @click="editingFolder = null" class="text-gray-400 hover:underline text-sm">Cancel</button>
        </div>

        <!-- Normal view -->
        <span v-else class="font-medium">{{ folder.folder_name }}</span>

        <!-- Actions -->
        <div v-if="editingFolder?.folder_id !== folder.folder_id" class="flex gap-3">
          <button
            @click="startEdit(folder)"
            class="text-sm text-blue-500 hover:underline"
          >Rename</button>
          <button
            @click="handleDelete(folder.folder_id)"
            class="text-sm text-red-500 hover:underline"
          >Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>