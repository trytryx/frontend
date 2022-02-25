import styles from './styles.module.scss';
import Button from 'components/Button';
import ButtonTheme from 'components/Button/ButtonTheme';
import Share from 'components/Share';

import GainBg1 from 'data/images/home/gain-bg1.png';
import GainBg2 from 'data/images/home/gain-bg2.png';
import GainBg3 from 'data/images/home/gain-bg3.png';

const GainBanner = ({isLoggedIn, handleClickSignUp, handleClickCreateEvent}) => {

  return (
    <div className={styles.howToGainBannerContainer}>
      <div className={styles.title}>
        <span className={styles.tip}>EARN MONEY</span>
        <h2>How to gain more PFAIR 💰</h2>
        <div className={styles.underline} />
      </div>
      <div className={styles.gainCards}>
        <div className={styles.gainCard}>
          <div className={styles.topBanner}>
            <img src={GainBg1} alt="Gain Banner 1" />
            <h3 className={styles.bannerTitle}>SIGN UP<br/><span className={styles.second}>AND GET<br/>100 PFAIR</span></h3>
          </div>
          <div className={styles.bottomBanner}>
            <h3>Sign up | 100 PFAIR</h3>
            <p>You can play out awesome house games to win on some PFAIR or bet on all kind of events.</p>
            {!isLoggedIn &&
              <Button
                onClick={handleClickSignUp}
                theme={ButtonTheme.primaryButtonM}
                className={styles.bannerButton}
              >
                Sign Up
              </Button>
            }
          </div>
        </div>
        <div className={styles.gainCard}>
          <div className={styles.topBanner}>
            <img src={GainBg2} alt="Gain Banner 2" />
            <h3 className={styles.bannerTitle}>INVITE A FRIEND<br/><span className={styles.second}>AND GET<br/>50 PFAIR</span></h3>
          </div>
          <div className={styles.bottomBanner}>
            <h3>Invite a friend | 50 PFAIR</h3>
            <p>By inviting friends to play.wallfair.io you will get rewarded with 50 PFAIR each verified user.</p>
            <Share 
              primary={true} 
              buttonText={'Invite a friend'} 
              className={styles.bannerButton} 
              popupPosition={'top'}
              skipCalculatePos={true}
            />
          </div>
        </div>
        <div className={styles.gainCard}>
          <div className={styles.topBanner}>
            <img src={GainBg3} alt="Gain Banner 3" />
            <h3 className={styles.bannerTitle}>CREATE AN EVENT<br/><span className={styles.second}>AND SHARE IT <br/>WITH FRIENDS</span></h3>
          </div>
          <div className={styles.bottomBanner}>
            <h3>Create Event &amp; Share | 50 PFAIR</h3>
            <p>Get 50 extra PFAIR for each sign-ups generated by links you share.</p>
            <Button
              onClick={handleClickCreateEvent}
              theme={ButtonTheme.primaryButtonM}
              className={styles.bannerButton}
            >
              Create Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GainBanner;