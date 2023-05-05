import React, { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { StyledNavMenu } from './NavMenu'

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const MenuFlyout = styled.span`
  min-width: 4.125rem;
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

const MenuItem = styled(NavLink)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  text-decoration: none;
  &.disabled {
    color: ${({ theme }) => theme.text3};
    pointer-events: none;
  }
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

export default function FarmMenuGroup() {
  const { href } = location
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.FARM)
  const toggle = useToggleModal(ApplicationModal.FARM)
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <StyledMenu ref={node as any}>
      <StyledNavMenu onClick={toggle} isActive={href.includes('/#/farm')}>
        Farm
      </StyledNavMenu>

      {open && (
        <MenuFlyout>
          <MenuItem
            id="link"
            to={'#'}
            onClick={(e) => {
              e.preventDefault()
              location.href = '/#/farm'
            }}
          >
            V2
          </MenuItem>
          <MenuItem
            id="link"
            to={'#'}
            onClick={(e) => {
              e.preventDefault()
              location.href = '/v3/#/farm'
            }}
          >
            V3
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
