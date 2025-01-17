import React, { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { ExternalLink } from '../../theme'
import { StyledNavMenu } from './NavMenu'

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const MenuFlyout = styled.span`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  right: 0rem;
  z-index: 100;
`

const MenuItem = styled(ExternalLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2} !important;
  :hover {
    color: ${({ theme }) => theme.text1} !important;
    cursor: pointer;
    text-decoration: none !important;
  }
  > svg {
    margin-right: 8px;
  }
`

const MenuItemInternalLink = styled(NavLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  text-decoration: none !important;
  &.disabled {
    pointer-events: none;
    color: ${({ theme }) => theme.text3};
  }
  :hover {
    color: ${({ theme }) => theme.text1} !important;
    cursor: pointer;
  }
  > svg {
    margin-right: 8px;
  }
`

export default function ChartsMenuGroup() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.CHARTS)
  const toggle = useToggleModal(ApplicationModal.CHARTS)
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <StyledNavMenu onClick={toggle}>Charts</StyledNavMenu>

      {open && (
        <MenuFlyout>
          <MenuItem id="link" href="https://info.ubeswap.org/">
            V2 Analytics
          </MenuItem>
          <MenuItemInternalLink
            className="disabled"
            id="link"
            to={'#'}
            onClick={(e) => {
              e.preventDefault()
              location.href = '/v3/#/info'
            }}
          >
            V3 Analytics
          </MenuItemInternalLink>
          <MenuItem id="link" href="https://celotracker.com">
            Celo Tracker
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
