import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Recursive function to update a category in a nested tree
const updateCategoryInTree = (tree, updatedCategory) => {
    return tree.map(cat => {
        if (cat.id === updatedCategory.id) {
            return { ...cat, ...updatedCategory };
        }
        if (cat.children && cat.children.length > 0) {
            return { ...cat, children: updateCategoryInTree(cat.children, updatedCategory) };
        }
        return cat;
    });
};

// Recursive function to remove a category from a nested tree
const removeCategoryFromTree = (tree, deletedId) => {
    return tree.filter(cat => cat.id !== deletedId).map(cat => ({
        ...cat,
        children: cat.children ? removeCategoryFromTree(cat.children, deletedId) : []
    }));
};

// Recursive function to add a subcategory to a specific parent in the tree
const addSubcategoryToTree = (tree, parentId, newCategory) => {
    return tree.map(cat => {
        if (cat.id === parseInt(parentId)) {
            return { ...cat, children: [...(cat.children || []), newCategory] };
        }
        if (cat.children && cat.children.length > 0) {
            return { ...cat, children: addSubcategoryToTree(cat.children, parentId, newCategory) };
        }
        return cat;
    });
};

export const fetchCategoryTree = createAsyncThunk(
    'categories/fetchCategoryTree',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('admin/categories/');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch categories');
        }
    }
);

export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('admin/categories/', categoryData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`admin/categories/${id}/`, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to update category');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`admin/categories/${id}/delete/`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to delete category');
        }
    }
);

const initialState = {
    tree: [],
    loading: false,
    error: null,
};

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategoryTree.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryTree.fulfilled, (state, action) => {
                state.loading = false;
                state.tree = action.payload;
            })
            .addCase(fetchCategoryTree.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createCategory.fulfilled, (state, action) => {
                const newCat = action.payload;
                if (!newCat.parent) {
                    state.tree.push(newCat);
                } else {
                    state.tree = addSubcategoryToTree(state.tree, newCat.parent, newCat);
                }
            })
            // Update
            .addCase(updateCategory.fulfilled, (state, action) => {
                const updated = action.payload;
                // If parent changed, we might need to move it... 
                // But for simplicity, we'll just update the node in-place if it's the same tree
                // or the user can refresh. More robust would be re-rendering the whole tree.
                // Re-fetch is safer for reparenting, but we'll try in-place update first.
                state.tree = updateCategoryInTree(state.tree, updated);
            })
            // Delete
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.tree = removeCategoryFromTree(state.tree, action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
