/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Collapse,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useState } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import classes from './navbar-links-group.module.css';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const navigate = useNavigate();

  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => (
    <Text<'a'>
      component='a'
      className={classes.link}
      key={link.label}
      onClick={() => {
        navigate(link.link);
      }}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify='space-between' gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant='light' size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Box ml='md'>{label}</Box>
          </Box>
          {hasLinks && (
            <TbChevronRight
              className={classes.chevron}
              size={16}
              style={{ transform: opened ? 'rotate(-90deg)' : 'none' }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
