'use client';

import { toast } from '@/components/ui/use-toast';
import { divisionsApi } from '@/lib/api/divisions-api';
import { addResourceApi, deleteResourceApi, getResources, updateResourceApi } from '@/lib/api/resourceApi';
import { Resource } from '@/types/resource';
import { create } from 'zustand';

export interface ResourceStore {
  resources: Resource[];
  divisions: string[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  divisionPages: Record<string, number>;
  fetchResources: () => Promise<void>;
  fetchDivisions: () => Promise<void>;
  addResource: (resource: Omit<Resource, '_id' | '__v'>) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setDivisionPage: (division: string, page: number) => void;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: [],
  divisions: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  itemsPerPage: 10,
  divisionPages: {},

  fetchResources: async () => {
    set({ isLoading: true, error: null });
    try {
      const { resources: fetchedResources } = await getResources(get().currentPage, get().itemsPerPage);
      
      // Validate fetched resources
      if (!Array.isArray(fetchedResources)) {
        throw new Error('Invalid resources data received');
      }

      // Log for debugging
      console.log('Fetched resources:', fetchedResources);
      
      set({ resources: fetchedResources, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resources';
      console.error('Error fetching resources:', error);
      set({ error: errorMessage, isLoading: false });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  },

  fetchDivisions: async () => {
    set({ isLoading: true, error: null });
    try {
      const divisions = await divisionsApi.getAllDivisions();
      
      // Validate fetched divisions
      if (!Array.isArray(divisions)) {
        throw new Error('Invalid divisions data received');
      }

      // Log for debugging
      console.log('Fetched divisions:', divisions);
      
      set({ divisions, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch divisions';
      console.error('Error fetching divisions:', error);
      set({ error: errorMessage, isLoading: false });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  },

  addResource: async (resource) => {
    set({ isLoading: true, error: null });
    try {
      // Log the resource being added
      console.log('Adding resource:', resource);

      // Optimistically add the resource
      const tempId = `temp-${Date.now()}`;
      const newResource = { ...resource, _id: tempId } as Resource;
      set(state => ({
        resources: [...state.resources, newResource]
      }));

      // Make the API call
      const addedResource = await addResourceApi(resource);
      
      // Log the response
      console.log('Added resource response:', addedResource);

      // Validate the response
      if (!addedResource || !addedResource._id) {
        throw new Error('Invalid resource data received from server');
      }

      // Update with the real resource
      set(state => ({
        resources: state.resources.map(r => 
          r._id === tempId ? addedResource : r
        ),
        isLoading: false
      }));
      
      toast({
        title: "Success",
        description: "Resource added successfully!",
        variant: "default"
      });
    } catch (error) {
      // Remove the optimistic resource on error
      set(state => ({
        resources: state.resources.filter(r => !r._id.startsWith('temp-')),
        isLoading: false
      }));

      const errorMessage = error instanceof Error ? error.message : 'Failed to add resource';
      console.error('Error adding resource:', error);
      set({ error: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  },

  updateResource: async (id, resource) => {
    set({ isLoading: true, error: null });
    try {
      // Log the update
      console.log('Updating resource:', { id, resource });

      // Optimistically update the resource
      set(state => ({
        resources: state.resources.map(r =>
          r._id === id ? { ...r, ...resource } : r
        )
      }));

      try {
        const updatedResource = await updateResourceApi(id, resource);
        
        // Log the response
        console.log('Updated resource response:', updatedResource);

        // Update with the real resource if we got one, otherwise keep the optimistic update
        set(state => ({
          resources: state.resources.map(r =>
            r._id === id ? (updatedResource || { ...r, ...resource }) : r
          ),
          isLoading: false
        }));

        toast({
          title: "Success",
          description: "Resource updated successfully!",
          variant: "default"
        });
      } catch (error) {
        // If it's the "No resource data" error but update was successful, show success
        if (error instanceof Error && error.message.includes('No resource data')) {
          set({ isLoading: false });
          toast({
            title: "Success",
            description: "Resource updated successfully!",
            variant: "default"
          });
          return;
        }
        throw error; // Re-throw other errors
      }
    } catch (error) {
      // Revert the optimistic update on error
      await get().fetchResources();
      const errorMessage = error instanceof Error ? error.message : 'Failed to update resource';
      console.error('Error updating resource:', error);
      set({ error: errorMessage, isLoading: false });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  },

  deleteResource: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Log the deletion
      console.log('Deleting resource:', id);

      // Optimistically remove the resource
      set(state => ({
        resources: state.resources.filter(r => r._id !== id)
      }));

      await deleteResourceApi(id);
      set({ isLoading: false });
      toast({
        title: "Success",
        description: "Resource deleted successfully!",
        variant: "default"
      });
    } catch (error) {
      // Revert the optimistic removal on error
      await get().fetchResources();
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete resource';
      console.error('Error deleting resource:', error);
      set({ error: errorMessage, isLoading: false });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
  setDivisionPage: (division, page) => 
    set(state => ({
      divisionPages: { ...state.divisionPages, [division]: page }
    })),
}));

export type { Resource };

