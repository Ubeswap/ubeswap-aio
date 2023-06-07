import React, { useMemo } from 'react'
import { useIsDarkMode } from 'state/user/hooks'

export const SquidWidget = () => {
  const isDarkMode = useIsDarkMode()

  const iframeUrl = useMemo(() => {
    const config = {
      companyName: 'Ubeswap',
      integratorId: 'ubeswap-swap-widget',
      style: isDarkMode
        ? {
            neutralContent: '#8579be',
            baseContent: '#e8e3e4',
            base100: '#2f3038',
            base200: '#222429',
            base300: '#161718',
            error: '#ED6A5E',
            warning: '#FFB155',
            success: '#62C555',
            primary: '#8579be',
            secondary: '#F3841E',
            secondaryContent: '#222429',
            neutral: '#1f2023',
            roundedBtn: '26px',
            roundedBox: '1rem',
            roundedDropDown: '20rem',
            displayDivider: true,
          }
        : {
            neutralContent: '#8579be',
            baseContent: '#000000',
            base100: '#f6f6f6',
            base200: '#ffffff',
            base300: '#ffffff',
            error: '#ED6A5E',
            warning: '#FFB155',
            success: '#62C555',
            primary: '#8579be',
            secondary: '#F3841E',
            secondaryContent: '#ffffff',
            neutral: '#ffffff',
            roundedBtn: '26px',
            roundedBox: '1rem',
            roundedDropDown: '20rem',
            displayDivider: true,
          },
      initialFromChainId: 42220,
    }
    const encodedConfig = encodeURIComponent(JSON.stringify(config))
    return `https://widget.squidrouter.com/iframe?config=${encodedConfig}`
  }, [isDarkMode])
  return (
    <span style={{ marginTop: '24px', width: '100%', maxWidth: '430px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <iframe title="Squid widget Iframe" src={iframeUrl} width="430" height="684" frameBorder="0" />
      </div>
    </span>
  )
}
