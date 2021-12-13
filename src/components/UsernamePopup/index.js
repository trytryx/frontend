import React, {useEffect, useState} from 'react'
import styles from './styles.module.scss';
import InputBox from '../InputBox';
import Button from '../Button';
import { connect } from 'react-redux';
import _ from 'lodash';
import { checkUsername } from '../../api';
import { OnboardingActions } from 'store/actions/onboarding';

const UsernamePopup = ({
                         hidePopup = () => {
                         },
                         showOnboardingFlowNext,
                         suggestion,
                         getSuggestion
                       }) => {
  const [username, setUsername] = useState(suggestion || '');
  const [errorMessage, setErrorMessage] = useState();
  useEffect(() => {
    setUsername(suggestion)
  }, [suggestion])
  const onConfirm = async () => {
    //check unique username
    let response;
    try {
      response = await checkUsername(username);
    } catch (err) {
      console.error('checkUsername err', err);
    }

    const isUnique = _.get(response, 'data.isUnique', false);

    if (isUnique) {
      setErrorMessage('');
      showOnboardingFlowNext(username)
      hidePopup();
    } else {
      setErrorMessage(
        <div>
          Username <b>"{username}"</b> already exists. Please use another name.
        </div>
      );
    }
  };

  const skipUsername = () => {
    hidePopup();
    showOnboardingFlowNext('');
  };

  return (
    <div className={styles.usernamePopup}>
      <h2 className={styles.title}>Complete your profile</h2>
      <div className={styles.container}>
        <div className={styles.description}>
          How would you like others to see you?<br/>
          Please pick a username for yourself or <span
          onClick={getSuggestion}
          className={styles.randomize}
        >
            Randomize
          </span>
        </div>
        <InputBox
          className={styles.inputBox}
          placeholder="Your Username..."
          value={username}
          setValue={setUsername}
          onConfirm={onConfirm}
        />
        {!_.isEmpty(errorMessage) && (
          <div className={styles.errorHandLing}>{errorMessage}</div>
        )}
        <div className={styles.buttons}>
          <span
            onClick={skipUsername}
            className={styles.skipButton}
          >
            Skip
          </span>

          <Button
            onClick={onConfirm}
            withoutBackground={true}
            className={styles.button}
            disabledWithOverlay={false}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    suggestion: state.onboarding.suggestion
  }
};

const mapDispatchToProps = dispatch => {
  return {
    showOnboardingFlowNext: username => {
      dispatch(
        OnboardingActions.next({
            payload: {username}
        })
      );
    },
    getSuggestion: () => {
      dispatch(OnboardingActions.getUsername())
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UsernamePopup);
