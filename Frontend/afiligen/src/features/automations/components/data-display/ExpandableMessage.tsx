import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

type Props = {
  text: string;
  collapsedMaxLines?: number;
};

export function ExpandableMessage({ text, collapsedMaxLines = 2 }: Props) {
  const textRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const lineHeightPx = 20;
  const collapsedMaxHeight = useMemo(
    () => collapsedMaxLines * lineHeightPx,
    [collapsedMaxLines],
  );

  const measure = () => {
    const el = textRef.current;
    if (!el) return;
    const overflowing = el.scrollHeight > el.clientHeight + 1;
    setIsOverflowing(overflowing);
  };

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [text, collapsedMaxHeight]);

  useEffect(() => {
    measure();
  }, [expanded]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography
        ref={textRef}
        component="div"
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',

          maxHeight: expanded ? 'none' : `${collapsedMaxHeight}px`,
          overflow: 'hidden',
          lineHeight: `${lineHeightPx}px`,
          pr: isOverflowing ? 4 : 0,
          pb: !expanded && isOverflowing ? 3 : 0,
        }}
      >
        {text}
      </Typography>

      {!expanded && isOverflowing && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 28,
            pointerEvents: 'none',

            backdropFilter: 'blur(1.5px)',
            WebkitBackdropFilter: 'blur(1.5px)',

            background:
              'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.85))',
          }}
        />
      )}

      {(isOverflowing || expanded) && (
        <IconButton
          size="small"
          onClick={() => setExpanded((v) => !v)}
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: expanded ? 4 : 2,
            transform: 'translateX(-50%)',
            zIndex: 3,

            backgroundColor: 'rgba(255,255,255,0.85)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
          }}
          aria-label={expanded ? 'Recolher mensagem' : 'Expandir mensagem'}
        >
          {expanded ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </IconButton>
      )}
    </Box>
  );
}
