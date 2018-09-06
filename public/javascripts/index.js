import axios from 'axios';

var functionsDomain = 'https://us-central1-familymarto2o.cloudfunctions.net/twitter';
// var functionsDomain = 'http://localhost:5000/familymarto2o/us-central1/twitter';
var fn = {
	checkUser(userId) {
		return new Promise((resolve, reject) => {
			axios.get('https://api.mobileads.com/coupons/user_info', {
				params: {
					id: userId
				}
			}).then((response) => {
				console.log(response);
				resolve(response.data);
			}).catch((error) => {
				console.error(error);
				reject(error);
			})
		});
	},
	IssueNewCoupon(userId) {
		return new Promise((resolve, reject) => {
			axios.post('https://api.mobileads.com/coupons/reissue?id=' + userId).then((response) => {
				console.log(response);
				resolve(response.data);
			}).catch((error) => {
				console.error(error);
				reject(error);
			});
		})
	},
	getTwitterName(id) {
		return axios.post(functionsDomain + '/getTwitterName', {
			id: id
		});
	},
	getCoupon(couponCode) {
		return new Promise((resolve, reject) => {
			axios.get('https://api.mobileads.com/coupons/user_info?couponCode=' + couponCode).then((response) => {
				console.log(response);
				resolve(response.data);
			}).catch((error) => {
				console.error(error);
				reject(error);
			})
		});
	},
	generateCouponLink(userId) {
		return 'https://couponcampaign.ienomistyle.com/サラダスムージーLIVE/coupon.html?userId=' + userId; 
	},
	generateSurveyLink(userId) {
		return 'https://couponcampaign.ienomistyle.com/サラダスムージーLIVE/?userId=' + userId; 
	},
	clearResult() {
		document.getElementById('notFound').style.display = 'none';
		document.getElementById('resultMsg').style.display = 'none';
		document.getElementById('issueBtn').style.display = 'none';
		document.getElementById('rlink').innerHTML = '';
	},
	showResult(userData, screen_name) {
		window.currentUser = userData;
		if (screen_name) {
			document.getElementById('rTwitName').style.display = 'inline-block';
			document.getElementById('rTwitName').innerHTML = 'twitter name: ' + screen_name;
		}
		else {
			document.getElementById('rTwitName').innerHTML = '';
			document.getElementById('rTwitName').style.display = 'none';
		}
		document.getElementById('rUserId').innerHTML = userData.id;
		document.getElementById('rUserState').innerHTML = userData.state;
		document.getElementById('rUserCoupon').innerHTML = userData.couponCode;
		if (userData.dateCreated) {
			var date = new Date(userData.dateCreated);
			document.getElementById('rUserDate').innerHTML = date;	
		}
		document.getElementById('resultMsg').style.display = 'block';
		if (userData.state == 'win') {
			document.getElementById('issueBtn').style.display = 'block';
			var cl = fn.generateCouponLink(userData.id);
			document.getElementById('rlink').innerHTML = 'Coupon Link: <a target="_blank" href="' + cl + '">' + cl + '</a>';
		}
		else if (userData.state == '-') {
			var sl = fn.generateSurveyLink(userData.id);
			document.getElementById('rlink').innerHTML = 'Survey Link: <a target="_blank" href="' + sl + '">' + sl + '</a>';
		}
		
	},
	clearCouponResult() {
		document.getElementById('cNotFound').style.display = 'none';
		document.getElementById('couponResult').style.display = 'none';
	},
	showCouponResult(userData, screen_name) {
		if (screen_name) {
			document.getElementById('cTwitName').style.display = 'inline-block';
			document.getElementById('cTwitName').innerHTML = 'twitter name: ' + screen_name;
		}
		else {
			document.getElementById('cTwitName').innerHTML = '';
			document.getElementById('cTwitName').style.display = 'none';
		}
		document.getElementById('cUserId').innerHTML = userData.id;
		if (userData.dateCreated) {
			document.getElementById('cUserDate').innerHTML = new Date(userData.dateCreated);	
		}
		document.getElementById('couponResult').style.display = 'block';	
	},
	trackReissue(oldCoupon, newCoupon, userId) {
		if (window.location.hostname.indexOf('localhost') < 0 && window.location.protocol != 'file:') {
			var value = userId + '_' + oldCoupon + '_' + newCoupon;
			var timestamp = Date.now();
			var pixel = document.createElement('img');
			pixel.src = 'https://track.richmediaads.com/a/analytic.htm?uid=0&isNew={{isNew}}&referredUrl={{referredUrl}}&rmaId=2&domainId=0&pageLoadId=' + timestamp + '&userId=4831&pubUserId=0&campaignId=e32e385370b2e04d225d2dfa5497483b&browser={{browser}}&os={{os}}&domain={{domain}}&callback=trackSuccess&type=coupon_reissue&tt=E&value=' + value + '&ty=E&uniqueId=' + userId;
			document.body.appendChild(pixel);
		}
	}
}

document.addEventListener('DOMContentLoaded', function() {
	console.log('hihi');
	var cForm = document.getElementById('cForm');
	var userId = document.getElementById('userId');
	var submitBtn = document.getElementById('submit-btn');
	var workingMsg = document.getElementById('working');
	var resultMsg = document.getElementById('resultMsg');
	var issueBtn = document.getElementById('issueBtn');
	window.currentUser = '';

	cForm.onsubmit = (e) => {
		e.preventDefault();

		if (userId.value) {
			submitBtn.style.display = 'none';
			workingMsg.style.display = 'block';
			workingMsg.innerHTML = 'Searching for user ' + userId.value + ' ...';
			fn.clearResult();
			if (userId.value.indexOf('@') > 0) {
				// email
				console.log('email');
				fn.checkUser(userId.value).then((response) => {
					workingMsg.style.display = 'none';
					if (response.status) {
						fn.showResult(response.user);
					}
					else {
						document.getElementById('notFound').style.display = 'block';
					}
					submitBtn.style.display = 'inline-block';
				}).catch((e) => {
					console.error(e)
					workingMsg.style.display = 'none';
					submitBtn.style.display = 'inline-block';
				});
			}
			else {
				//twitter
				console.log('twitter');
				var isTwitterId = /^\d+$/.test(userId.value);
				console.log(isTwitterId);
				if (!isTwitterId) {
					axios.post(functionsDomain + '/getTwitterId', {
						id: userId.value
					})
					.then((res) => {
						console.log(res);
						fn.checkUser(res.data.id).then((response) => {
							workingMsg.style.display = 'none';
							submitBtn.style.display = 'inline-block';
							if (response.status) {
								fn.showResult(response.user, res.data.screen_name);
							}
							else {
								document.getElementById('notFound').style.display = 'block';
							}
						}).catch((e) => {
							console.error(e)
							workingMsg.style.display = 'none';
							submitBtn.style.display = 'inline-block';
						});
					}).catch((err) => {
						console.error(error);
						workingMsg.style.display = 'none';
						submitBtn.style.display = 'inline-block';
					});
				}
				else {
					fn.checkUser(userId.value).then((response) => {
						if (response.status) {
							fn.getTwitterName(response.user.id).then((r) => {
								workingMsg.style.display = 'none';
								console.log(r);
								fn.showResult(response.user, r.data.screen_name);
							}).catch((e) => {
								workingMsg.style.display = 'none';
								console.error(e);
								fn.showResult(response.user);
							})
							
						}
						else {
							workingMsg.style.display = 'none';
							document.getElementById('notFound').style.display = 'block';
						}
						submitBtn.style.display = 'inline-block';
					}).catch((e) => {
						console.error(e)
						workingMsg.style.display = 'none';
						submitBtn.style.display = 'inline-block';
					});
				}
			}

		}
		else {
			alert('input is empty!')
		}
	}

	issueBtn.onclick = () => {
		console.log(window.currentUser)	
		issueBtn.style.display = 'none';
		workingMsg.style.display = 'block';
		workingMsg.innerHTML = 'Issuing new coupon for userId ' + window.currentUser.id + ' ...';

		fn.IssueNewCoupon(window.currentUser.id).then((response) => {
			if (response.status) {
				fn.trackReissue(window.currentUser.couponCode, response.newCouponCode, window.currentUser.id);
				document.getElementById('issueResult').innerHTML += '<p>new coupon ' + response.newCouponCode + ' issued to user ' + window.currentUser.id + '</p>';
			}
			else {
				document.getElementById('issueResult').innerHTML += '<p>Something went wrong. User might not exist.</p>'
			}
			issueBtn.style.display = 'block';
		}).catch((error) => {
			console.error(error);
			document.getElementById('issueResult').innerHTML += '<p>Something went wrong.</p>';
			issueBtn.style.display = 'block';
		});
	}

	checkCouponOwner.onclick = () => {
		var couponCode = document.getElementById('couponInput').value;
		if (couponCode) {
			fn.clearCouponResult();
			document.getElementById('cWorking').innerHTML = 'Searching owner of ' + couponCode ;
			document.getElementById('cWorking').style.display = 'block';
			fn.getCoupon(couponCode).then((response) => {
				console.log(response);
				if (response.status) {
					fn.getTwitterName(response.user.id).then((r) => {
						fn.showCouponResult(response.user, r.data.screen_name);
						document.getElementById('cWorking').style.display = 'none';
					}).catch((e) => {
						console.error(e);
						fn.showCouponResult(response.user);
						document.getElementById('cWorking').style.display = 'none';
					})
					
				}
				else {
					document.getElementById('cNotFound').innerHTML = response.message;
					document.getElementById('cNotFound').style.display = 'block';
					document.getElementById('cWorking').style.display = 'none';
				}
			}).catch((error) => {
				console.error(error);
				document.getElementById('cWorking').style.display = 'none';
			});
		}
		else {
			alert('coupon code input is empty!');
		}
	}
});