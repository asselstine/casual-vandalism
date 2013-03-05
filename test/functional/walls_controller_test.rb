require 'test_helper'

class WallsControllerTest < ActionController::TestCase
  setup do
    @wall = walls(:one)
    sign_in users(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:walls)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create wall with: w, h, color" do
    assert_difference('Wall.count') do
      post :create, wall: { w: 100, h: 100, color: "black", name: "This is a new name" }
    end
    assert_redirected_to wall_path(assigns(:wall))
  end

  test "should create wall with: url" do
    assert_difference('Wall.count') do
      post :create, wall: { background_url: @wall.background_url, name: "This is a different name" }
    end
    assert_redirected_to wall_path(assigns(:wall))
  end

  test "should show wall" do
    get :show, id: @wall
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @wall
    assert_response :success
  end

  test "should update wall" do
    new_name = "Superclasldk"
    put :update, id: @wall, wall: { name: new_name }
    wall = assigns(:wall)
    assert_equal new_name, wall.name
    assert_redirected_to walls_path
  end

  test "should destroy wall" do
    assert_difference('Wall.count', -1) do
      delete :destroy, id: @wall
    end

    assert_redirected_to walls_path
  end
end
