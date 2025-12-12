/**
 * ShapeSelector - Dropdown menu for selecting shape types in whiteboard
 */

import { useTranslation } from 'react-i18next'
import {
  Square,
  Circle,
  Diamond,
  Triangle,
  Hexagon,
  Star,
  StickyNote,
  Type,
  ArrowRight,
  Frame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Block } from '../../data/schema'

interface ShapeSelectorProps {
  selectedShape?: Block['shapeType']
  onShapeSelect: (shape: Block['shapeType']) => void
}

const shapeIcons: Record<NonNullable<Block['shapeType']>, React.ComponentType<{ size?: number; className?: string }>> = {
  rectangle: Square,
  ellipse: Circle,
  diamond: Diamond,
  triangle: Triangle,
  hexagon: Hexagon,
  star: Star,
  sticky: StickyNote,
  text_shape: Type,
  arrow: ArrowRight,
  frame: Frame,
}

export function ShapeSelector({ selectedShape, onShapeSelect }: ShapeSelectorProps) {
  const { t } = useTranslation()

  const CurrentIcon = selectedShape ? shapeIcons[selectedShape] : Square

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={selectedShape ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
            >
              <CurrentIcon size={16} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('whiteboard.tools.shapes', 'Shapes')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onShapeSelect('rectangle')}>
          <Square size={14} className="me-2" />
          {t('whiteboard.shapes.rectangle', 'Rectangle')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('ellipse')}>
          <Circle size={14} className="me-2" />
          {t('whiteboard.shapes.ellipse', 'Ellipse')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('diamond')}>
          <Diamond size={14} className="me-2" />
          {t('whiteboard.shapes.diamond', 'Diamond')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('triangle')}>
          <Triangle size={14} className="me-2" />
          {t('whiteboard.shapes.triangle', 'Triangle')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('hexagon')}>
          <Hexagon size={14} className="me-2" />
          {t('whiteboard.shapes.hexagon', 'Hexagon')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('star')}>
          <Star size={14} className="me-2" />
          {t('whiteboard.shapes.star', 'Star')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('sticky')}>
          <StickyNote size={14} className="me-2" />
          {t('whiteboard.shapes.sticky', 'Sticky Note')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('text_shape')}>
          <Type size={14} className="me-2" />
          {t('whiteboard.shapes.text', 'Text')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('arrow')}>
          <ArrowRight size={14} className="me-2" />
          {t('whiteboard.shapes.arrow', 'Arrow')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShapeSelect('frame')}>
          <Frame size={14} className="me-2" />
          {t('whiteboard.shapes.frame', 'Frame')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ShapeSelector
