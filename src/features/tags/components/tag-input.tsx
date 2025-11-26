import { useState, useRef, useEffect } from 'react'
import { X, Plus, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  useSearchTags,
  usePopularTags,
  useTagsForEntity,
  useAddTagToEntity,
  useRemoveTagFromEntity,
  useCreateTag,
} from '@/hooks/useTags'
import { type Tag } from '../data/schema'
import { tagColors } from '../data/data'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface TagInputProps {
  entityType: 'case' | 'client' | 'contact' | 'document'
  entityId: string
  className?: string
  disabled?: boolean
}

export function TagInput({
  entityType,
  entityId,
  className,
  disabled = false,
}: TagInputProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newTagColor, setNewTagColor] = useState('#3B82F6')

  const { data: entityTags = [], isLoading: loadingEntityTags } =
    useTagsForEntity(entityType, entityId)
  const { data: searchResults = [] } = useSearchTags(
    searchQuery,
    entityType
  )
  const { data: popularTags = [] } = usePopularTags(entityType, 5)

  const addTagToEntity = useAddTagToEntity()
  const removeTagFromEntity = useRemoveTagFromEntity()
  const createTag = useCreateTag()

  const entityTagIds = entityTags.map((tag) => tag._id)

  // Filter out already added tags from suggestions
  const availableTags = (searchQuery ? searchResults : popularTags).filter(
    (tag) => !entityTagIds.includes(tag._id)
  )

  const handleAddTag = (tag: Tag) => {
    addTagToEntity.mutate({
      tagId: tag._id,
      entityType,
      entityId,
    })
    setSearchQuery('')
  }

  const handleRemoveTag = (tagId: string) => {
    removeTagFromEntity.mutate({
      tagId,
      entityType,
      entityId,
    })
  }

  const handleCreateAndAdd = () => {
    if (!searchQuery.trim()) return

    createTag.mutate(
      {
        name: searchQuery,
        color: newTagColor,
        entityType,
      },
      {
        onSuccess: (newTag) => {
          addTagToEntity.mutate({
            tagId: newTag._id,
            entityType,
            entityId,
          })
          setSearchQuery('')
          setShowCreateNew(false)
          setOpen(false)
        },
      }
    )
  }

  const getDisplayName = (tag: Tag) => {
    return isArabic && tag.nameAr ? tag.nameAr : tag.name
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Display existing tags */}
      <div className='flex flex-wrap gap-1.5'>
        {entityTags.map((tag) => (
          <Badge
            key={tag._id}
            variant='secondary'
            className='flex items-center gap-1 pe-1'
            style={{ borderColor: tag.color, borderWidth: 2 }}
          >
            <div
              className='h-2 w-2 rounded-full'
              style={{ backgroundColor: tag.color }}
            />
            <span className='text-xs'>{getDisplayName(tag)}</span>
            {!disabled && (
              <button
                type='button'
                onClick={() => handleRemoveTag(tag._id)}
                className='ms-1 rounded-full p-0.5 hover:bg-muted'
                disabled={removeTagFromEntity.isPending}
              >
                <X className='h-3 w-3' />
              </button>
            )}
          </Badge>
        ))}

        {/* Add tag button */}
        {!disabled && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-6 border-dashed px-2 text-xs'
              >
                <Plus className='me-1 h-3 w-3' />
                {t('tags.addTag')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-64 p-0' align='start'>
              <Command>
                <CommandInput
                  placeholder={t('tags.searchTags')}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {searchQuery && (
                      <div className='p-2'>
                        {!showCreateNew ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start'
                            onClick={() => setShowCreateNew(true)}
                          >
                            <Plus className='me-2 h-4 w-4' />
                            {t('tags.addTag')}: "{searchQuery}"
                          </Button>
                        ) : (
                          <div className='space-y-2'>
                            <p className='text-xs text-muted-foreground'>
                              {t('tags.color')}:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {tagColors.slice(0, 12).map((color) => (
                                <button
                                  key={color.value}
                                  type='button'
                                  onClick={() => setNewTagColor(color.value)}
                                  className={cn(
                                    'h-5 w-5 rounded-full border-2',
                                    newTagColor === color.value
                                      ? 'border-primary scale-110'
                                      : 'border-transparent'
                                  )}
                                  style={{ backgroundColor: color.value }}
                                />
                              ))}
                            </div>
                            <div className='flex gap-1'>
                              <Button
                                size='sm'
                                className='flex-1'
                                onClick={handleCreateAndAdd}
                                disabled={createTag.isPending}
                              >
                                <Check className='me-1 h-3 w-3' />
                                {t('common.add')}
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => setShowCreateNew(false)}
                              >
                                {t('common.cancel')}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!searchQuery && (
                      <p className='p-2 text-center text-xs text-muted-foreground'>
                        {t('tags.noTags')}
                      </p>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {availableTags.map((tag) => (
                      <CommandItem
                        key={tag._id}
                        onSelect={() => handleAddTag(tag)}
                        className='flex items-center gap-2'
                      >
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{getDisplayName(tag)}</span>
                        {tag.usageCount !== undefined && tag.usageCount > 0 && (
                          <span className='ms-auto text-xs text-muted-foreground'>
                            ({tag.usageCount})
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
