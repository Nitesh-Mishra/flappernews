angular.module('flapperNews', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
      postPromise: ['posts', function(posts){
        return posts.getAll();
      }]
    }
    });

    $stateProvider
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl',
      resolve: {
      post: ['$stateParams', 'posts', function($stateParams, posts) {
        return posts.get($stateParams.id);
      }]
    }
    });

  $urlRouterProvider.otherwise('home');
}])

.factory('posts', ['$http', function($http){
  var o = {
    posts: [
      {title: 'post 1', link: 'link1',upvotes: 5},
      {title: 'post 2', link: 'link2',upvotes: 2},
      {title: 'post 3', link: 'link3',upvotes: 15},
      {title: 'post 4', link: 'link4',upvotes: 9},
      {title: 'post 5', link: 'link5',upvotes: 4}
    ]   
  };

  o.getAll = function() {
    return $http.get('/posts.json').success(function(data){
      angular.copy(data, o.posts);
    });
  };

  o.create = function(post) {
    return $http.post('/posts.json', post).success(function(data){
      o.posts.push(data);
    });
  };

  o.upvote = function(post) {
  return $http.put('/posts/' + post.id + '/upvote.json')
    .success(function(data){
      post.upvotes += 1;
    });
  };

  o.get = function(id) {
    return $http.get('/posts/' + id + '.json').then(function(res){
      return res.data;
    });
  };

  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments.json', comment);
  };

  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post.id + '/comments/'+ comment.id + '/upvote.json')
      .success(function(data){
        comment.upvotes += 1;
      });
  };

  return o;
}])

.controller('PostsCtrl', [
'$scope',
'posts',
'post',
function($scope, posts, post){
    $scope.post = post;
    $scope.post.comments=[];
    $scope.addComment = function(){
      if($scope.body === '') { alert("Field can't left blank"); return; }
      posts.addComment(post.id, {
        body: $scope.body,
        author: 'user',
      }).success(function(comment) {
        $scope.post.comments.push(comment);
      });
      $scope.body = '';
    };

    $scope.incrementUpvotes = function(comment){
      posts.upvoteComment(post, comment);
    };

    
}])

.controller('MainCtrl', [ '$scope', 'posts',
function($scope, posts){
    $scope.posts = posts.posts; 
    $scope.addPost = function(){
    if(!$scope.title || $scope.title === '') { alert("Field can't left blank"); return; }
    posts.create({
      title: $scope.title,
      link: $scope.link,
    });
    $scope.title = '';
    $scope.link = '';
  };
  
  $scope.incrementUpvotes = function(post) {
    posts.upvote(post);
  };


}]);
