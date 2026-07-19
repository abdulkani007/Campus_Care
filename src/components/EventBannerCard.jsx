import React from 'react';
import './EventBannerCard.css';

const EventBannerCard = ({ banner }) => {
  if (!banner || !banner.title || !banner.active) return null;

  const tickerText = `✨ CAMPUSCARE HOSTEL ANNOUNCEMENT • ${banner.title.toUpperCase()} • SCHEDULED FOR ${banner.date ? banner.date.toUpperCase() : 'UPCOMING'} • ALL HOSTEL BLOCKS WELCOME ✨`;

  return (
    <div className="event-banner-card">
      {/* Ambient Glowing Radial Orbs */}
      <div className="event-banner-glow-orb-1"></div>
      <div className="event-banner-glow-orb-2"></div>

      {/* Faded Background Image Overlay */}
      {banner.bannerImage && (
        <div className="event-banner-img-overlay">
          <img src={banner.bannerImage} alt="Event Background" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="event-banner-content">
        {/* Pulsing Live Badge */}
        <div className="event-banner-badge">
          <span className="event-banner-pulse-dot"></span>
          <span>Hostel Event Announcement</span>
        </div>

        {/* Title */}
        <h3 className="event-banner-title">{banner.title}</h3>

        {/* Description */}
        {banner.description && (
          <p className="event-banner-desc">{banner.description}</p>
        )}

        {/* Schedule Date Badge */}
        <div className="event-banner-schedule-pill">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span>Scheduled: {banner.date || 'To be announced'}</span>
        </div>

        {/* Animated Continuous Looping Ticker Strip */}
        <div className="event-banner-ticker-wrap">
          <div className="event-banner-ticker-track">
            <span className="event-banner-ticker-item">{tickerText}</span>
            <span className="event-banner-ticker-item">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBannerCard;
