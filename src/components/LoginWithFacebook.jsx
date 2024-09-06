import { useEffect, useState } from "react";

const LoginWithFacebook=()=>{
    const [user, setUser] = useState(null);
    const [feed, setFeed] = useState([]);
    const [pages, setPages] = useState([]);
    const [selectedPageId, setSelectedPageId] = useState(null);
    const [pageAccessToken, setPageAccessToken] = useState(null);
    const [insights, setInsights] = useState({
      followers: '-',
      engagement: '-',
      impressions: '-',
      reactions: '-',
    });
  
  
    useEffect(() => {
      window.fbAsyncInit = function() {
        FB.init({
          // appId: '530616452880370', 
          appId:"1232752081189388",
          cookie: true,
          xfbml: true,
          version: 'v20.0'
        });
  
        FB.getLoginStatus(function(response) {
          statusChangeCallback(response);
        });
       
      };
  
      // Load the SDK script
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }, []);
  
    const statusChangeCallback = (response) => {
      if (response.status === 'connected') {
        console.log('Logged in and authenticated');
        testAPI();
      } else {
        console.log('Not authenticated');
        setUser(null);
      }
    };
  
    const checkLoginState = (response) => {
        console.log("jhvjgvhgyu",response);
        
        fetchAdAccounts(response.authResponse.accessToken);
        
      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    };

    //scope means permisions
    //Create a normal app in facebook 
    //On click of login call handleFBLogin()
    //handleFBLogin function call checkLoginState() 
    //checkLoginState() call fetchAdAccounts() and statusChangeCallback()->call testAPI()
    //fetchAdAccounts() call fetchPageDetails() and fetchPageInsights()
    const handleFBLogin =async () => {
        FB.login(checkLoginState, 
          {
             scope: 'ads_read, ads_management, public_profile, email,read_insights, pages_read_engagement,pages_read_user_content' ,

        });
        

      };
  
    const testAPI = () => {
      FB.api('/me?fields=name,email,birthday,location,picture', function(response){
        if(response && !response.error){
          console.log("test",response);
          setUser(response);
        }
        
        FB.api('/me/feed', function(feedResponse){
          if(feedResponse && !feedResponse.error){
            setFeed(feedResponse.data);
          }
        });
      });
    };
    //Get accounts /me?fields=accounts
    function fetchAdAccounts(accessToken) {
      FB.api(
        '/me',
        'GET',
        {"fields":"id,birthday,name,accounts"},
        function(response) {
            console.log(response);
            response.accounts.data.forEach(page => {
              fetchPageDetails(page.id, accessToken);
              fetchPageInsights(page.id,page.access_token)
            });
            
        }
      );
    }


    // get details from a perticular page id /page_id?fields=id,name,fan_count
    function fetchPageDetails(pageId, accessToken) {
      FB.api(
        `/${pageId}`,
        'GET',
        {
          fields: 'id,name,fan_count,posts',
          access_token: accessToken
        },
        function(response) {
          if (response && !response.error) {
            console.log('Page Details:', response);
            // Handle page details, including likes and posts
          } else {
            console.error('Error fetching page details:', response.error);
          }
        }
      );
    }

    //get insights from perticular page /pageId/insights?metric=page_total_action
    //here its need the page access token not the account access token
    function fetchPageInsights(pageId, pageAccessToken) {
      FB.api(
        `/${pageId}/insights`,
        'GET',
        {
          metric: 'post_engaged_users,page_impressions,post_reactions_by_type_total',
          access_token: pageAccessToken
        },
        function(response) {
          if (response && !response.error) {
            console.log('Page Insights:', response);
            // Handle page insights
          } else {
            console.error('Error fetching page insights:', response.error);
          }
        }
      );
    }
  
    const logout = () => {
      FB.logout(function(response){
        setUser(null);
        setFeed([]);
      });
    };
  
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
            <div className="mb-4">
              <ul className="flex justify-end">
                {user ? (
                  <li>
                    <a href="/" onClick={logout} className="text-red-500 hover:text-red-700">
                      Logout
                    </a>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={handleFBLogin}
                      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                    >
                      Login with Facebook
                    </button>
                  </li>
                )}
              </ul>
            </div>
      
            <div className="text-center">
              {!user && (
                <h3 id="heading" className="text-xl font-semibold text-gray-700">
                  Log in to view your profile
                </h3>
              )}
      
              {user && (
                <div id="profile" className="mt-6">
                  <img
                    src={user.picture.data.url}
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{user.name}</h3>
                  <ul className="bg-gray-50 rounded-lg shadow-sm p-4 space-y-3">
                    <li className="text-sm text-gray-600">
                      <span className="font-medium">User ID:</span> {user.id}
                    </li>
                    <li className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {user.email}
                    </li>
                    <li className="text-sm text-gray-600">
                      <span className="font-medium">Birthday:</span> {user.birthday}
                    </li>
                  </ul>
                </div>
              )}
      
              {feed.length > 0 && (
                <div id="feed" className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Latest Posts</h3>
                  <div className="space-y-4">
                    {feed.map((post, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                      >
                        <p className="text-gray-700">{post.message}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_time).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
      
      
    };
export default LoginWithFacebook