<?php
namespace Grav\Plugin;

use Grav\Common\Page\Collection;
use Grav\Common\Plugin;
use Grav\Common\Twig\TwigExtension;
use Grav\Common\Uri;
use Grav\Common\Taxonomy;

class TwigPlugin extends Plugin
{
  public static function getSubscribedEvents() {
      return [
          'onTwigExtensions' => ['onTwigExtensions', 0],
      ];
  }

  public function onTwigExtensions()
  {
    // $this->grav['twig']->twig()->addExtension(new \Twig_Extensions_Extension_Intl());
  }
}
