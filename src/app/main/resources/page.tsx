"use client"

import ResourceModal from "@/components/resources/ResourceModal"
import Button from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Resource, useResourceStore } from "@/stores/resourceStore"
import { useEffect, useState } from "react"
import { FiChevronDown, FiChevronUp, FiEdit, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi"

export default function ResourcesPage() {
  const {
    resources,
    divisions,
    isLoading,
    fetchResources,
    fetchDivisions,
    addResource,
    updateResource,
    deleteResource,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  } = useResourceStore()

  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState<Resource | null>(null)
  const [currentDivision, setCurrentDivision] = useState<string | null>(null)
  const [expandedDivisions, setExpandedDivisions] = useState<Record<string, boolean>>({})
  const [totalPages, setTotalPages] = useState(1)

  // Load data on mount and when currentPage changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        await Promise.all([fetchResources(), fetchDivisions()])
      } catch (err) {
        setError('Failed to load resources. Please try again later.')
        console.error("Error loading resources:", err)
      }
    }
    loadData()
  }, [fetchResources, fetchDivisions, currentPage])

  // Keep divisionPages and expandedDivisions in sync with divisions
  useEffect(() => {
    if (divisions.length > 0) {
      setExpandedDivisions(divisions.reduce((acc, division) => ({ ...acc, [division]: expandedDivisions[division] ?? true }), {}))
    }
  }, [divisions])

  // Calculate total pages for global pagination
  useEffect(() => {
    // Assume all resources are fetched for the current page
    // If you have totalCount from the backend, use it here
    // For now, estimate based on resources length
    const total = Math.ceil(resources.length / itemsPerPage) || 1
    setTotalPages(total)
  }, [resources, itemsPerPage])

  // Handle resource submission (add/update)
  const handleSubmit = async (resourceData: Omit<Resource, '_id' | '__v'>) => {
    try {
      if (currentResource) {
        await updateResource(currentResource._id, resourceData)
      } else {
        await addResource(resourceData)
      }
      closeModal()
    } catch (error: unknown) {
      // Only log actual errors, not the "No resource data" error
      if (error instanceof Error && !error.message?.includes('No resource data')) {
        console.error('Submission error:', error)
      }
    }
  }

  // Handle resource deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id)
      } catch (error) {
        console.error('Deletion error:', error)
      }
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentResource(null)
    setCurrentDivision(null)
  }

  const toggleDivision = (division: string) => {
    setExpandedDivisions(prev => ({
      ...prev,
      [division]: !prev[division]
    }))
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-8 dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-gray-100">Resources</h1>
        <Button
          onClick={() => {
            setCurrentResource(null)
            setCurrentDivision(divisions[0] || null)
            setIsModalOpen(true)
          }}
          className="bg-blue-800 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          disabled={isLoading || divisions.length === 0}
        >
          <FiPlus className="mr-2" />
          Add Resource
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
              <Skeleton className="h-8 w-1/4 mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : divisions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium dark:text-gray-200">No divisions found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please add a division first before adding resources.
          </p>
        </div>
      ) : (
        divisions.map((division) => {
          const totalDivisionResources = resources.filter(r => r.division === division).length

          return (
            <div key={division} className="border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-6">
                <h2 className="text-xl font-bold dark:text-gray-200">{division}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Showing {totalDivisionResources} resources
                </p>
              </div>

              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <button
                  onClick={() => toggleDivision(division)}
                  className="flex w-full justify-between items-center py-2 font-medium dark:text-gray-200"
                >
                  <span>{division} Resources</span>
                  {expandedDivisions[division] ? (
                    <FiChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>

                {expandedDivisions[division] && (
                  <div className="space-y-4 mt-2">
                    {resources.filter(r => r.division === division).map(resource => (
                      <div key={resource._id} className="flex items-start justify-between p-4 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <div className="flex items-start space-x-3">
                          <FiExternalLink className="h-5 w-5 mt-1 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                          <div>
                            <h3 className="font-medium dark:text-gray-200">{resource.resourceName}</h3>
                            <a
                              href={resource.resourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                            >
                              {resource.resourceLink}
                            </a>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentResource(resource)
                              setIsModalOpen(true)
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(resource._id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {resources.filter(r => r.division === division).length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">No resources found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}

      <ResourceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        divisions={divisions}
        currentResource={currentResource}
        currentDivision={currentDivision}
      />
    </div>
  )
}